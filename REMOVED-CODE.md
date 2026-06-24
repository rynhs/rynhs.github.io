# Removed code (kept for easy restore)

Snippets pulled out of `index.html` on request. Paste back where noted to restore.

---

## 1. RYNH wordmark icicles

Grew icicles from the bottom edge of the crystal "RYNH" wordmark and merged them into one piece of ice. Removed because the user wanted the plain dented crystal wordmark with no icicles.

**Restore:** in the `{ const font=new FontLoader().parse(SYNCOPATE_RYNH); ... }` block, replace the line
`core.geometry.dispose(); core.geometry=g;   // icicles removed ...`
with the block below. Needs `mergeGeometries` (already imported) and `g` = the dented TextGeometry.

```js
      g.computeBoundingBox(); const BB=g.boundingBox, probe=new THREE.Mesh(g,new THREE.MeshBasicMaterial());
      // icicles grown from the bottom edge, merged into the wordmark = one continuous piece of ice
      const ray=new THREE.Raycaster(), UP=new THREE.Vector3(0,1,0), Rr=(a,b)=>a+(b-a)*Math.random();
      const cleanG=o=>{ const q=o.index?o.toNonIndexed():o.clone(); for(const k of Object.keys(q.attributes)) if(k!=='position'&&k!=='normal'&&k!=='uv') q.deleteAttribute(k); if(!q.attributes.normal)q.computeVertexNormals(); return q; };
      const bottomY=(x,z)=>{ ray.set(new THREE.Vector3(x,BB.min.y-1,z),UP); const r=ray.intersectObject(probe,false); return (r.length&&r[0].face.normal.y<-0.2)?r[0].point.y:null; };
      const fits=(x,z,y,r)=>{ for(const o of [[r,0],[-r,0],[0,r],[0,-r]]){ const yy=bottomY(x+o[0],z+o[1]); if(yy===null||Math.abs(yy-y)>0.12) return false; } return true; };
      const YS=[0,0.10,0.22,0.40,0.55,0.72,0.86,0.95,1.0], RS=[1,0.85,0.96,0.64,0.73,0.44,0.29,0.13,0.02];
      const icicle=(L,r0)=>{ const pts=[]; for(let i=0;i<YS.length;i++) pts.push(new THREE.Vector2(Math.max(0.004,r0*RS[i]),-L*YS[i])); return new THREE.LatheGeometry(pts,8).toNonIndexed(); };
      const hits=[], hh=BB.max.y-BB.min.y, st=0.03;
      for(let x=BB.min.x;x<=BB.max.x;x+=st)for(let z=BB.min.z+0.05;z<=BB.max.z-0.05;z+=st){ ray.set(new THREE.Vector3(x,BB.min.y-1,z),UP); const r=ray.intersectObject(probe,false); if(r.length&&r[0].face.normal.y<-0.25&&r[0].point.y<BB.min.y+hh*0.14) hits.push(r[0].point.clone()); }
      hits.sort((a,b)=>a.x-b.x);
      const bunches=[]; let cur=[]; for(const p of hits){ if(cur.length&&p.x-cur[cur.length-1].x>0.12){ bunches.push(cur); cur=[]; } cur.push(p); } if(cur.length) bunches.push(cur);
      const parts=[cleanG(g)];
      for(const b of bunches){ const minX=b[0].x, span=Math.max(1e-3,b[b.length-1].x-minX), used=[];
        for(let k=0;k<3;k++){ const tx=minX+span*(0.18+0.64*k/2), cands=b.filter(p=>Math.abs(p.x-tx)<=st*1.6); if(!cands.length) continue;
          for(let t=0;t<10;t++){ const p=cands[(Math.random()*cands.length)|0], r0=Rr(0.024,0.05), z=Math.min(Math.max(p.z,BB.min.z+r0+0.02),BB.max.z-r0-0.02);
            if(!fits(p.x,z,p.y,r0+0.01)) continue; if(used.some(u=>Math.abs(u.x-p.x)<0.05&&Math.abs(u.z-z)<0.12)) continue;
            const L=0.17+Math.pow(Math.random(),0.95)*0.47, ic=icicle(L,r0); ic.rotateZ(Rr(-0.06,0.06)); ic.translate(p.x,p.y+0.035,z); parts.push(cleanG(ic)); used.push({x:p.x,z}); break; } } }
      core.geometry.dispose(); core.geometry=mergeGeometries(parts,false);
```

---

## 2. RYNH top-bar wordmark (logo dropdown trigger)

Replaced by the left-side `>` slide-out menu. This was the top-left clickable "RYNH ⌄" wordmark that opened the service menu on hover.

**HTML** (was inside `<div class="topbar">`, first child):

```html
    <div class="navwrap">
      <button class="mark" id="navmark" aria-haspopup="true"><span class="wm">RY<b>NH</b></span><span class="chev">⌄</span></button>
      <ul class="navmenu" id="navmenu"></ul>
    </div>
```

**CSS:**

```css
  .navwrap{position:relative;pointer-events:auto}
  .topbar .mark{font-family:"Syncopate",sans-serif;font-weight:700;letter-spacing:.08em;font-size:15px;background:none;border:none;color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:4px 2px}
  .topbar .mark b{color:var(--accent)}
  .chev{font-size:14px;line-height:1;opacity:.65;transform:translateY(-1px);transition:transform .3s,opacity .2s}
  .navwrap:hover .chev{opacity:1;transform:translateY(1px) rotate(180deg)}
```

The menu list (`.navmenu`) and its item styles were kept and re-anchored to the new left-side `.sidenav` container.
