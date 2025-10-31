import React from 'react';
import './CategoryNav.css';
import { api } from '../api';

type Cat = { id: number; name: string; slug: string; parentId?: number | null };

export default function CategoryNav() {
  const [cats, setCats] = React.useState<Cat[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const list = (await api.listCategories()) as Cat[];
        setCats(list);
        const roots = list.filter((c) => !c.parentId);
        if (roots.length) setActive(roots[0].id);
      } catch {
        // ignore
      }
    })();
  }, []);

  const roots = cats.filter((c) => !c.parentId);
  const childrenByParent = React.useMemo(() => {
    const map = new Map<number, Cat[]>();
    for (const c of cats) if (c.parentId) {
      const arr = map.get(c.parentId) || [];
      arr.push(c);
      map.set(c.parentId, arr);
    }
    return map;
  }, [cats]);

  const activeChildren = active ? (childrenByParent.get(active) || []) : [];

  return (
    <div className="catnav" onMouseLeave={() => setOpen(false)}>
      <div className="catnav__wrap">
        <button className="catnav__trigger" onMouseEnter={() => setOpen(true)} onClick={() => setOpen((v) => !v)}>
          Todos os departamentos
        </button>
        {roots.slice(0, 6).map((c) => (
          <button key={c.id} className="catnav__btn" onMouseEnter={() => { setOpen(true); setActive(c.id); }}>
            {c.name}
          </button>
        ))}
      </div>

      {open && (
        <div className="mega">
          <aside className="mega__left">
            {roots.map((r) => (
              <button
                key={r.id}
                className={"mega__left-item" + (active === r.id ? ' is-active' : '')}
                onMouseEnter={() => setActive(r.id)}
              >
                {r.name}
              </button>
            ))}
          </aside>
          <section className="mega__right">
            {activeChildren.length === 0 ? (
              <div className="mega__placeholder">Selecione uma categoria</div>
            ) : (
              <div className="mega__grid">
                {activeChildren.map((sc) => (
                  <div key={sc.id} className="mega__col">
                    <div className="mega__title">{sc.name}</div>
                    <a className="mega__link" href={`/?cat=${encodeURIComponent(sc.slug)}`}>Ver tudo</a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

