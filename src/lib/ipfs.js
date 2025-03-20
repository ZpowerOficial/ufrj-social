import * as IPFS from 'ipfs-core';
import OrbitDB from 'orbit-db';

// Singleton para IPFS
let ipfs = null;
let orbitdb = null;
let postsDb = null;

export async function initIPFS() {
  if (ipfs) return { ipfs, orbitdb, postsDb };
  
  try {
    console.log('Iniciando IPFS...');
    ipfs = await IPFS.create({
      repo: 'ufrj-social-ipfs',
      start: true,
      preload: { enabled: false },
      config: {
        Bootstrap: [],
        Addresses: {
          Swarm: [
            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
          ]
        }
      }
    });
    
    console.log('IPFS iniciado com sucesso!');
    console.log('ID do Nó IPFS:', (await ipfs.id()).id);
    
    // Iniciar OrbitDB
    orbitdb = await OrbitDB.createInstance(ipfs);
    
    // Criar/abrir banco de dados de posts
    postsDb = await orbitdb.docstore('ufrj-social-posts', {
      accessController: {
        write: ['*'] // Qualquer pessoa pode escrever (validação na app)
      }
    });
    
    await postsDb.load();
    console.log('OrbitDB inicializado:', postsDb.address.toString());
    
    return { ipfs, orbitdb, postsDb };
  } catch (error) {
    console.error('Erro ao iniciar IPFS:', error);
    throw error;
  }
}

export async function addContent(content) {
  if (!ipfs) await initIPFS();
  
  const contentStr = typeof content === 'string' 
    ? content 
    : JSON.stringify(content);
  
  const result = await ipfs.add(contentStr);
  return result.cid.toString();
}

export async function getContent(cid) {
  if (!ipfs) await initIPFS();
  
  const stream = await ipfs.cat(cid);
  let data = '';
  
  for await (const chunk of stream) {
    data += new TextDecoder().decode(chunk);
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

export async function addPostToOrbit(post) {
  if (!postsDb) await initIPFS();
  
  // Adicionar o conteúdo ao IPFS
  const contentCid = await addContent(post.content);
  
  // Criar entrada no OrbitDB
  const orbitPost = {
    ...post,
    contentCid,
    createdAt: post.createdAt || Date.now()
  };
  
  const hash = await postsDb.put(orbitPost);
  return { hash, cid: contentCid };
}

export async function getPostsFromOrbit() {
  if (!postsDb) await initIPFS();
  
  return postsDb.get('');
}