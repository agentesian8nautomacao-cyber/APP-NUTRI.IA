import React, { useEffect, useState } from 'react';
import { X, Users, CheckCircle2, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/supabaseService';

interface DashboardB2BProps {
  onClose: () => void;
}

interface LicenseInfo {
  total_licenses: number;
  active_licenses: number;
  available_licenses: number;
  students: Array<{
    user_id: string;
    name: string;
    email: string;
    created_at: string;
    last_active_date: string;
  }>;
}

const DashboardB2B: React.FC<DashboardB2BProps> = ({ onClose }) => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLicenseInfo();
  }, []);

  const loadLicenseInfo = async () => {
    try {
      setIsLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      // Buscar informações do cupom vinculado
      const { data: couponLink, error: linkError } = await supabase
        .from('user_coupon_links')
        .select('coupon_id')
        .eq('user_id', user.id)
        .single();

      if (linkError || !couponLink) {
        setError('Nenhum código de ativação encontrado');
        return;
      }

      // Buscar informações do cupom
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('max_uses, current_uses, max_linked_accounts')
        .eq('id', couponLink.coupon_id)
        .single();

      if (couponError || !coupon) {
        setError('Erro ao buscar informações do código');
        return;
      }

      // Buscar alunos vinculados
      const { data: students, error: studentsError } = await supabase
        .from('user_coupon_links')
        .select(`
          user_id,
          created_at,
          user_profiles:user_id (
            name,
            email,
            last_active_date
          )
        `)
        .eq('coupon_id', couponLink.coupon_id);

      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
      }

      const totalLicenses = coupon.max_linked_accounts || coupon.max_uses || 0;
      const activeLicenses = students?.length || 0;
      const availableLicenses = totalLicenses - activeLicenses;

      const studentsList = (students || []).map((s: any) => ({
        user_id: s.user_id,
        name: s.user_profiles?.name || 'Sem nome',
        email: s.user_profiles?.email || 'Sem email',
        created_at: s.created_at,
        last_active_date: s.user_profiles?.last_active_date || s.created_at,
      }));

      setLicenseInfo({
        total_licenses: totalLicenses,
        active_licenses: activeLicenses,
        available_licenses: availableLicenses,
        students: studentsList,
      });
    } catch (err) {
      console.error('Erro ao carregar informações:', err);
      setError('Erro ao carregar informações');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif text-[#1A4D2E] font-bold">
              Dashboard B2B
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie suas licenças e alunos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadLicenseInfo}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw size={20} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="animate-spin text-[#1A4D2E]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : licenseInfo ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#F5F1E8] p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-[#1A4D2E]" size={24} />
                    <h3 className="font-bold text-[#1A4D2E]">Total de Licenças</h3>
                  </div>
                  <p className="text-3xl font-bold text-[#1A4D2E]">
                    {licenseInfo.total_licenses}
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="text-green-600" size={24} />
                    <h3 className="font-bold text-green-600">Licenças Ativas</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {licenseInfo.active_licenses}
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-blue-600" size={24} />
                    <h3 className="font-bold text-blue-600">Licenças Disponíveis</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {licenseInfo.available_licenses}
                  </p>
                </div>
              </div>

              {/* Students List */}
              <div className="bg-white rounded-2xl border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-[#1A4D2E] flex items-center gap-2">
                    <Users size={20} />
                    Alunos Vinculados ({licenseInfo.students.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {licenseInfo.students.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Nenhum aluno vinculado ainda</p>
                    </div>
                  ) : (
                    licenseInfo.students.map((student) => (
                      <div key={student.user_id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-[#1A4D2E]">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Vinculado: {formatDate(student.created_at)}</span>
                              <span>•</span>
                              <span>Último acesso: {formatDate(student.last_active_date)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Ativo</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DashboardB2B;

