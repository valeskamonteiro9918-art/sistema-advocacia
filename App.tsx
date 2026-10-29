              </div>
              <div>
                <label className="font-bold block mb-1">Descrição Curta</label>
                <input type="text" value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Conteúdo do Modelo</label>
                <textarea rows={6} value={newTemplate.content} onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })} className="w-full p-2.5 border rounded-lg font-mono text-xs" />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => { setIsNewTemplateOpen(false); setEditingItem(null); }} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>{editingItem?.type === 'template' ? 'Salvar Alterações' : 'Salvar Modelo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR STATUS DO COMPROMISSO (AO CLICAR) */}
      {selectedDeadlineModal && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                Editar / Alterar Status do Compromisso
              </h3>
              <button onClick={() => setSelectedDeadlineModal(null)}><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Título do Prazo</label>
                <input
                  type="text"
                  value={selectedDeadlineModal.title}
                  onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Status Atual</label>
                <select
                  value={selectedDeadlineModal.status || 'Em Andamento'}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedDeadlineModal({
                      ...selectedDeadlineModal,
                      status: newStatus,
                      completed: newStatus === 'Finalizado'
                    });
                  }}
                  className="w-full p-2.5 border rounded-lg font-bold bg-amber-50 cursor-pointer"
                  style={{ borderColor: PALETTE.dourado }}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Finalizado">Finalizado / Cumprido</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Data</label>
                  <input
                    type="date"
                    value={selectedDeadlineModal.dueDate}
                    onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, dueDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Horário</label>
                  <input
                    type="time"
                    value={selectedDeadlineModal.dueTime}
                    onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, dueTime: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Tipo / Urgência</label>
                <select
                  value={selectedDeadlineModal.type}
                  onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, type: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="FATAL">FATAL</option>
                  <option value="NORMAL">NORMAL</option>
                </select>
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                <button
                  type="button"
                  onClick={() => {
                    setDeadlines(deadlines.filter((d) => d.id !== selectedDeadlineModal.id));
                    setSelectedDeadlineModal(null);
                  }}
                  className="px-3 py-2 rounded-lg text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50"
                >
                  <Trash2 size={14} /> Excluir
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDeadlineModal(null)}
                    className="px-4 py-2 rounded-lg border font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeadlines(deadlines.map((d) => (d.id === selectedDeadlineModal.id ? selectedDeadlineModal : d)));
                      setSelectedDeadlineModal(null);
                    }}
                    className="px-4 py-2 rounded-lg text-white font-bold"
                    style={{ backgroundColor: PALETTE.bordoPrincipal }}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
