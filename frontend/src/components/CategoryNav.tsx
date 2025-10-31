import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryNav.css';
import { api } from '../api';

type Cat = { id: number; name: string; slug: string; parentId?: number | null };

export default function CategoryNav() {
  const [cats, setCats] = React.useState<Cat[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  const navigate = useNavigate();

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
        <button className="catnav__trigger" aria-pressed={open} onClick={() => setOpen((v) => !v)}>
          <span className="catnav__hamburger" aria-hidden="true">
            <span className="bar"/>
            <span className="bar"/>
            <span className="bar"/>
          </span>
          Todos os departamentos
        </button>
        {roots.slice(0, 6).map((c) => (
          <button
            key={c.id}
            className="catnav__btn"
            onMouseEnter={() => { setActive(c.id); }}
            onClick={() => { navigate(`/category/${encodeURIComponent(c.slug)}?catId=${c.id}`); setOpen(false); }}
          >
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
                onClick={() => { navigate(`/category/${encodeURIComponent(r.slug)}?catId=${r.id}`); setOpen(false); }}
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
                    <a className="mega__link" href={`/category/${encodeURIComponent(sc.slug)}?catId=${sc.id}`}>Ver tudo</a>
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
