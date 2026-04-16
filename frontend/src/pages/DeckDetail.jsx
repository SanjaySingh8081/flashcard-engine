import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { decksAPI, cardsAPI } from '../api';

function IconEdit() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export default function DeckDetail() {
  const { id } = useParams();

  const [deck, setDeck]             = useState(null);
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [addForm, setAddForm]       = useState({ front: '', back: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState({ front: '', back: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [deckRes, cardsRes] = await Promise.all([decksAPI.getOne(id), cardsAPI.getAll(id)]);
      setDeck(deckRes.data);
      setCards(cardsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const dueCount = cards.filter((c) => new Date(c.nextReview) <= new Date()).length;

  const filteredCards = cards.filter(
    (c) =>
      c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCard = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await cardsAPI.create(id, addForm);
      setCards([data, ...cards]);
      setDeck((d) => ({ ...d, cardCount: d.cardCount + 1 }));
      setAddForm({ front: '', back: '' });
      setShowAddCard(false);
    } catch (err) { alert(err.response?.data?.message || 'Failed to add card'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await cardsAPI.delete(id, cardId);
      setCards(cards.filter((c) => c._id !== cardId));
      setDeck((d) => ({ ...d, cardCount: d.cardCount - 1 }));
    } catch { alert('Failed to delete card'); }
  };

  const startEdit = (card) => { setEditingId(card._id); setEditForm({ front: card.front, back: card.back }); };
  const handleEditSave = async (cardId) => {
    try {
      const { data } = await cardsAPI.update(id, cardId, editForm);
      setCards(cards.map((c) => (c._id === cardId ? data : c)));
      setEditingId(null);
    } catch { alert('Failed to update card'); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
      <p className="text-gray-400 text-sm mt-3">Loading deck…</p>
    </div>
  );

  if (!deck) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400">
      Deck not found.{' '}
      <Link to="/" className="text-indigo-600 hover:underline font-medium">Go home</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-5 sm:mb-7 min-w-0">
        <Link to="/" className="text-gray-400 hover:text-indigo-600 transition font-medium whitespace-nowrap">Decks</Link>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700 font-semibold truncate">{deck.title}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-5 sm:mb-6">
        {/* Deck info */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{deck.title}</h1>
          {deck.description && (
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{deck.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {cards.length} card{cards.length !== 1 ? 's' : ''}
            </span>
            {dueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
                {dueCount} due
              </span>
            )}
            {dueCount === 0 && cards.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full whitespace-nowrap">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                All caught up
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — full width stacked on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Add Card */}
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold text-sm transition min-h-[44px]"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Card
          </button>

          {/* Study Due */}
          {dueCount > 0 ? (
            <Link to={`/decks/${id}/study?mode=due`}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-semibold text-sm transition shadow-md shadow-orange-200 min-h-[44px]">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Study Due · {dueCount} card{dueCount !== 1 ? 's' : ''}
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-200 text-gray-300 px-4 py-3 rounded-xl font-semibold text-sm min-h-[44px] cursor-not-allowed select-none">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Study Due · 0 due
            </div>
          )}

          {/* Study All */}
          <Link to={`/decks/${id}/study?mode=all`}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-4 py-3 rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-200 min-h-[44px]">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Study All · {cards.length} card{cards.length !== 1 ? 's' : ''}
          </Link>
        </div>
      </div>

      {/* Add Card form */}
      {showAddCard && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-5 animate-fade-up">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">+</span>
            New Card
          </h3>
          <form onSubmit={handleAddCard} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Front</label>
                <textarea required autoFocus value={addForm.front}
                  onChange={(e) => setAddForm({ ...addForm, front: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition"
                  rows={3} placeholder="Question or term" />
              </div>
              <div>
                <label className="block text-xs font-bold text-violet-500 uppercase tracking-wider mb-1.5">Back</label>
                <textarea required value={addForm.back}
                  onChange={(e) => setAddForm({ ...addForm, back: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white resize-none transition"
                  rows={3} placeholder="Answer or definition" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowAddCard(false); setAddForm({ front: '', back: '' }); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold transition min-h-[44px]">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-200 disabled:opacity-60 min-h-[44px]">
                {submitting ? 'Adding…' : 'Add Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      {cards.length > 0 && (
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards…"
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition min-h-[44px]" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-500 transition rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-sm text-gray-400 font-medium whitespace-nowrap flex-shrink-0 hidden sm:block">
            {search ? `${filteredCards.length} of ${cards.length}` : `${cards.length} card${cards.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* Card list */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-5 border border-indigo-100">
            <span className="text-3xl">🃏</span>
          </div>
          <p className="text-lg font-bold text-gray-700 mb-1">No cards yet</p>
          <p className="text-gray-400 text-sm">Tap "Add Card" above to get started</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="font-bold text-gray-700 mb-1">No results for "{search}"</p>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCards.map((card, idx) => (
            <div key={card._id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all overflow-hidden animate-fade-up"
              style={{ animationDelay: `${idx * 0.03}s` }}>

              {editingId === card._id ? (
                /* ── Edit mode ── */
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Front</label>
                      <textarea autoFocus value={editForm.front}
                        onChange={(e) => setEditForm({ ...editForm, front: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition"
                        rows={3} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-violet-500 uppercase tracking-wider mb-1.5">Back</label>
                      <textarea value={editForm.back}
                        onChange={(e) => setEditForm({ ...editForm, back: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white resize-none transition"
                        rows={3} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)}
                      className="flex-1 sm:flex-none text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-semibold transition min-h-[44px]">
                      Cancel
                    </button>
                    <button onClick={() => handleEditSave(card._id)}
                      className="flex-1 sm:flex-none text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm min-h-[44px]">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Left accent (desktop only) */}
                  <div className="hidden sm:block w-1 bg-gradient-to-b from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

                  {/* Front + Back — stacked on mobile, side-by-side on sm+ */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 min-w-0">
                    <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1.5">Front</div>
                      <div className="text-sm text-gray-700 leading-relaxed break-words">{card.front}</div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1.5">Back</div>
                      <div className="text-sm text-gray-600 leading-relaxed break-words">{card.back}</div>
                    </div>
                  </div>

                  {/*
                    Edit / Delete:
                    - Mobile: horizontal row at the bottom with icon + text label, min 44px
                    - Desktop: vertical column on the right, icon only (fades in on hover)
                  */}
                  <div className="flex sm:flex-col border-t sm:border-t-0 sm:border-l border-gray-100 divide-x sm:divide-x-0 sm:divide-y divide-gray-100 flex-shrink-0 sm:opacity-40 sm:group-hover:opacity-100 sm:transition-opacity">
                    <button onClick={() => startEdit(card)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-0 sm:w-12 py-3 sm:py-0 sm:aspect-square text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition min-h-[44px]"
                      title="Edit card">
                      <IconEdit />
                      <span className="sm:hidden text-sm font-medium">Edit</span>
                    </button>
                    <button onClick={() => handleDeleteCard(card._id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-0 sm:w-12 py-3 sm:py-0 sm:aspect-square text-gray-500 hover:text-red-500 hover:bg-red-50 transition min-h-[44px]"
                      title="Delete card">
                      <IconTrash />
                      <span className="sm:hidden text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
