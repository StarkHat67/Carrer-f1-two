import React, { useState } from 'react';
import { useCareer } from './CareerContext';
import { DrivingStyle } from '../../types/database';
import {
  X,
  Flame,
  Wrench,
  Shield,
  Activity,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface NewCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StyleConfig {
  id: DrivingStyle;
  label: string;
  desc: string;
  icon: typeof Flame;
  benefits: string[];
  weaknesses: string[];
}

const DRIVING_STYLES: StyleConfig[] = [
  {
    id: 'Agressivo',
    label: 'Agressivo',
    desc: 'Ataca espaços menores e assume mais riscos em disputas diretas.',
    icon: Flame,
    benefits: ['+ ultrapassagem', '+ largadas'],
    weaknesses: ['- consistência', '- desgaste de pneus'],
  },
  {
    id: 'Técnico',
    label: 'Técnico',
    desc: 'Especialista em voltas rápidas e leitura precisa do traçado.',
    icon: Wrench,
    benefits: ['+ qualificação', '+ pista molhada'],
    weaknesses: ['- agressividade em disputas', '- largadas'],
  },
  {
    id: 'Consistente',
    label: 'Consistente',
    desc: 'Ritmo constante, poucos erros e excelente preservação do equipamento.',
    icon: Shield,
    benefits: ['+ consistência', '+ gestão de pneus'],
    weaknesses: ['- ultrapassagens arrojadas', '- qualificação'],
  },
  {
    id: 'Calculista',
    label: 'Calculista',
    desc: 'Prioriza a corrida e ataca estrategicamente no momento ideal.',
    icon: Activity,
    benefits: ['+ ritmo de corrida', '+ defesa de posição'],
    weaknesses: ['- adaptação a imprevistos', '- largadas'],
  },
  {
    id: 'Instintivo',
    label: 'Instintivo',
    desc: 'Pilota no limite por intuição pura e reage instantaneamente aos rivais.',
    icon: Zap,
    benefits: ['+ confiança', '+ largadas'],
    weaknesses: ['- disciplina de corrida', '- desgaste de pneus'],
  },
];

export const NewCareerModal: React.FC<NewCareerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { countries, createNewCareer } = useCareer();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryId, setCountryId] = useState('BRA');
  const [racingNumber, setRacingNumber] = useState<number>(7);
  const [drivingStyle, setDrivingStyle] = useState<DrivingStyle>('Agressivo');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (step === 1) {
      if (!lastName.trim()) {
        setErrorMessage('Informe ao menos o sobrenome do piloto.');
        return;
      }
      if (racingNumber < 1 || racingNumber > 99) {
        setErrorMessage('O número deve ser entre 1 e 99.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleStartCareer = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      await createNewCareer({
        firstName: firstName.trim() || 'Piloto',
        lastName: lastName.trim(),
        countryId,
        racingNumber,
        drivingStyle,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Falha ao iniciar carreira:', err);
      setErrorMessage('Não foi possível conectar ao serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = countries.find((c) => c.id === countryId) || countries[0];
  const selectedStyleObj = DRIVING_STYLES.find((s) => s.id === drivingStyle) || DRIVING_STYLES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#121620] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0d1017]">
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-100">
              Nova Carreira
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 1 ? 'text-red-500' : 'text-slate-500'}`}>
                1. Identidade
              </span>
              <span className="text-slate-700">•</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 2 ? 'text-red-500' : 'text-slate-500'}`}>
                2. Estilo
              </span>
              <span className="text-slate-700">•</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 3 ? 'text-red-500' : 'text-slate-500'}`}>
                3. Confirmação
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mx-5 sm:mx-6 mt-4 p-3.5 bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conteúdo do Passo 1: IDENTIDADE */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nome
                </label>
                <input
                  id="input-driver-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Ayrton"
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sobrenome *
                </label>
                <input
                  id="input-driver-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Senna"
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  País / Nacionalidade
                </label>
                <select
                  id="select-driver-country"
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag_emoji} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Número de Corrida (1 a 99)
                </label>
                <input
                  id="input-driver-number"
                  type="number"
                  min={1}
                  max={99}
                  value={racingNumber}
                  onChange={(e) => setRacingNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                id="btn-step1-next"
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <span>Avançar para Estilo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Conteúdo do Passo 2: ESTILO DE PILOTAGEM */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-xs text-slate-400">
              Escolha as características naturais do seu piloto em pista:
            </p>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {DRIVING_STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = drivingStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setDrivingStyle(style.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-950/20 border-red-500/70 shadow-md'
                        : 'bg-[#0a0d14] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold uppercase text-slate-100">
                          {style.label}
                        </h4>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      {style.desc}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                      {style.benefits.map((b, i) => (
                        <span key={i} className="text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded">
                          {b}
                        </span>
                      ))}
                      {style.weaknesses.map((w, i) => (
                        <span key={i} className="text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                id="btn-step2-next"
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <span>Revisar e Confirmar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo do Passo 3: CONFIRMAÇÃO */}
        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="bg-[#0a0d14] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCountry?.flag_emoji || '🏁'}</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-100">
                      {firstName.trim()} {lastName.trim()}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedCountry?.name} • 16 anos
                    </p>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center font-black text-xl text-red-500 font-mono">
                  #{racingNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#121620] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                    Categoria Inicial
                  </span>
                  <span className="text-slate-200 font-bold">Fórmula 4 Brasil</span>
                </div>

                <div className="bg-[#121620] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                    Estilo de Pilotagem
                  </span>
                  <span className="text-red-400 font-bold">{selectedStyleObj.label}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedStyleObj.desc}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                id="btn-confirm-start-career"
                type="button"
                disabled={loading}
                onClick={handleStartCareer}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-red-950/50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>COMEÇAR CARREIRA</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
