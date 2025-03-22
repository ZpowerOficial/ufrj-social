import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';

const CURSOS = [
  'Ciência da Computação',
  'Engenharia de Computação',
  'Sistemas de Informação',
  'Engenharia Eletrônica',
  'Engenharia de Controle e Automação',
  'Engenharia Mecânica',
  'Engenharia Civil',
  'Engenharia de Produção',
  'Engenharia Química',
  'Engenharia Naval',
  'Engenharia Nuclear',
  'Engenharia Metalúrgica',
  'Engenharia de Materiais',
  'Engenharia Ambiental',
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'Medicina',
  'Enfermagem',
  'Farmácia',
  'Odontologia',
  'Psicologia',
  'Direito',
  'Administração',
  'Economia',
  'Contabilidade',
  'Arquitetura e Urbanismo',
  'Letras',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Serviço Social',
  'Comunicação Social',
  'Artes',
  'Música',
  'Educação Física'
];

const CENTROS = [
  'CCMN - Centro de Ciências Matemáticas e da Natureza',
  'CCS - Centro de Ciências da Saúde',
  'CLA - Centro de Letras e Artes',
  'CFCH - Centro de Filosofia e Ciências Humanas',
  'CCJE - Centro de Ciências Jurídicas e Econômicas',
  'CT - Centro de Tecnologia',
  'EEFD - Escola de Educação Física e Desportos',
  'FCC - Fórum de Ciência e Cultura'
];

export default function EditProfileDialog({ open, onOpenChange }) {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
    curso: profile?.curso || '',
    centro: profile?.centro || '',
    periodo_ingresso: profile?.periodo_ingresso || '',
    dre: profile?.dre || '',
    lattes: profile?.lattes || '',
    github: profile?.github || '',
    linkedin: profile?.linkedin || '',
    is_staff: profile?.is_staff || false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Nome de Exibição</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar_url">URL do Avatar</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => handleChange('avatar_url', e.target.value)}
                placeholder="https://exemplo.com/seu-avatar.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="is_staff" className="flex items-center justify-between">
                <span>Você é funcionário da UFRJ?</span>
                <Switch 
                  id="is_staff"
                  checked={formData.is_staff}
                  onCheckedChange={(checked) => handleChange('is_staff', checked)}
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.is_staff 
                  ? "Seu nome será destacado como funcionário da UFRJ" 
                  : "Seu perfil será exibido como aluno"
                }
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Conte um pouco sobre você"
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Curso</Label>
                <Select
                  value={formData.curso}
                  onValueChange={(value) => handleChange('curso', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURSOS.map((curso) => (
                      <SelectItem key={curso} value={curso}>
                        {curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Centro</Label>
                <Select
                  value={formData.centro}
                  onValueChange={(value) => handleChange('centro', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu centro" />
                  </SelectTrigger>
                  <SelectContent>
                    {CENTROS.map((centro) => (
                      <SelectItem key={centro} value={centro}>
                        {centro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="periodo_ingresso">Período de Ingresso</Label>
                <Input
                  id="periodo_ingresso"
                  value={formData.periodo_ingresso}
                  onChange={(e) => handleChange('periodo_ingresso', e.target.value)}
                  placeholder="2023.1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dre">DRE</Label>
                <Input
                  id="dre"
                  value={formData.dre}
                  onChange={(e) => handleChange('dre', e.target.value)}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lattes">Currículo Lattes</Label>
                <Input
                  id="lattes"
                  value={formData.lattes}
                  onChange={(e) => handleChange('lattes', e.target.value)}
                  placeholder="http://lattes.cnpq.br/seu-curriculo"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => handleChange('github', e.target.value)}
                  placeholder="seu-usuario-github"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/seu-perfil"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 