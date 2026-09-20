import React, { useState } from 'react';
import { useCareer } from '../career/CareerContext';
import { useAuth } from '../auth/AuthContext';
import { GameWorld } from '../../types/database';
import {
  Layers,
  Plus,
  Play,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface SavesViewProps {
  onOpenNewCareer: () => void;
  onSelectSaveSuccess: () => void;
}

export const SavesView: React.FC<SavesViewProps> = ({
  onOpenNewCareer,
  onSelectSaveSuccess,
}) => {
  const { saves, activeWorld, selectWorld, deleteSave, loadingSaves, playerDriver, series } = useCareer();
  const { currentUser } = useAuth();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSelectSave = async (world: GameWorld) => {
    await selectWorld(world);
    onSelectSaveSuccess();
  };

  const handleDelete = async (worldId: string) => {
    try {
      setDeletingId(worldId);
      await deleteSave(worldId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Erro ao excluir carreira:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
              Carreiras
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Piloto: <span className="text-slate-200 font-bold">{currentUser?.username}</span>
            </p>
          </div>
        </div>

        <button
          id="btn-saves-create-new"
          onClick={onOpenNewCareer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Carreira</span>
        </button>
      </div>

      {/* Lista de Carreiras */}
      {loadingSaves ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Carregando suas carreiras...</span>
        </div>
      ) : saves.length === 0 ? (
        <div className="bg-[#121620] border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-4">
          <p className="text-sm font-medium">Você ainda não possui nenhuma carreira iniciada.</p>
          <button
            onClick={onOpenNewCareer}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Iniciar Primeira Carreira</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {saves.map((save) => {
            const isActive = activeWorld?.id === save.id;
            const isConfirming = confirmDeleteId === save.id;
            const isDeleting = deletingId === save.id;

            const formattedDate = new Date(save.updated_at || save.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={save.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-[#151a26] border-red-500/60 shadow-lg'
                    : 'bg-[#121620] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-slate-100">
                        {save.name}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          Carreira Ativa
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Ano: <strong className="text-slate-200 font-mono">{save.current_year}</strong></span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Salvo em {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isConfirming ? (
                      <div className="flex items-center gap-2 bg-red-950/40 p-1.5 rounded-xl border border-red-900/60">
                        <span className="text-xs text-red-300 font-medium px-2">
                          Confirmar exclusão?
                        </span>
                        <button
                          onClick={() => handleDelete(save.id)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        {!isActive && (
                          <button
                            onClick={() => handleSelectSave(save)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Carregar</span>
                          </button>
                        )}

                        <button
                          onClick={() => setConfirmDeleteId(save.id)}
                          className="p-2 rounded-xl bg-[#0a0d14] hover:bg-red-950/40 border border-slate-800 hover:border-red-900/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir carreira"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
