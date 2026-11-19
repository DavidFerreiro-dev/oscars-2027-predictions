import React, { useEffect, useMemo, useState } from 'react'
import { Award, Film, Search, Trophy, Download, Copy, ChevronDown, X, Plus, GripVertical, Star, Clapperboard, Sparkles, Check, Menu } from 'lucide-react'
import { TMDB_ACCESS_TOKEN } from './tmdb.config.js'

const IMAGE = 'https://image.tmdb.org/t/p/'
const CATEGORIES = [
  { id:'picture', name:'Best Picture', group:'Major', limit:10, type:'movie' },
  { id:'director', name:'Best Director', group:'Major', limit:5, type:'person' },
  { id:'actor', name:'Best Actor', group:'Major', limit:5, type:'person' },
  { id:'actress', name:'Best Actress', group:'Major', limit:5, type:'person' },
  { id:'supporting-actor', name:'Best Supporting Actor', group:'Major', limit:5, type:'person' },
  { id:'supporting-actress', name:'Best Supporting Actress', group:'Major', limit:5, type:'person' },
  { id:'original-screenplay', name:'Best Original Screenplay', group:'Crafts', limit:5, type:'movie' },
  { id:'adapted-screenplay', name:'Best Adapted Screenplay', group:'Crafts', limit:5, type:'movie' },
  { id:'international', name:'Best International Feature', group:'Crafts', limit:5, type:'movie' },
  { id:'animation', name:'Best Animated Feature', group:'Crafts', limit:5, type:'movie' },
  { id:'cinematography', name:'Best Cinematography', group:'Crafts', limit:5, type:'movie' },
  { id:'score', name:'Best Original Score', group:'Crafts', limit:5, type:'movie' },
  { id:'production-design', name:'Best Production Design', group:'Crafts', limit:5, type:'movie' },
  { id:'visual-effects', name:'Best Visual Effects', group:'Crafts', limit:5, type:'movie' },
]
const blank = Object.fromEntries(CATEGORIES.map(c => [c.id, []]))
const readToken = () => TMDB_ACCESS_TOKEN || ''

function App(){
  const [predictions,setPredictions] = useState(() => { try { return {...blank,...JSON.parse(localStorage.getItem('oscars27-predictions') || '{}')} } catch { return blank } })
  const [active,setActive] = useState(CATEGORIES[0].id)
  const [tab,setTab] = useState('categories')
  const [query,setQuery] = useState('')
  const [results,setResults] = useState([])
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const token = readToken()
  const [dragged,setDragged] = useState(null)
  const [mobileMenu,setMobileMenu] = useState(false)
  const [mainOnly,setMainOnly] = useState(false)
  const [movieSearchFor,setMovieSearchFor] = useState(null)
  const [movieQuery,setMovieQuery] = useState('')
  const [movieResults,setMovieResults] = useState([])
  const [movieLoading,setMovieLoading] = useState(false)
  const [roleLoading,setRoleLoading] = useState(null)
  const category = CATEGORIES.find(c=>c.id===active)
  const total = Object.values(predictions).reduce((n,a)=>n+a.length,0)
  const filled = CATEGORIES.filter(c=>predictions[c.id]?.length).length

  useEffect(()=>{ localStorage.setItem('oscars27-predictions',JSON.stringify(predictions)) },[predictions])
  useEffect(()=>{ setQuery(''); setResults([]); setError('') },[active])
  useEffect(()=>{
    if(query.trim().length<2){setResults([]);return}
    const timer=setTimeout(async()=>{
      setLoading(true);setError('')
      try{
        if(!token) throw new Error('TMDB token is not configured in the .env file.')
        const endpoint=category.type==='movie'?'search/movie':'search/person'
        const params=new URLSearchParams({query:query.trim(),include_adult:'false',language:'en-US',page:'1'})
        const res=await fetch(`https://api.themoviedb.org/3/${endpoint}?${params}`,{headers:{Authorization:`Bearer ${token}`,accept:'application/json'}})
        if(!res.ok) throw new Error(res.status===401?'Invalid token. Check your TMDB credentials.':`TMDB returned error ${res.status}.`)
        const data=await res.json();const found=data.results||[];if(category.type==='movie')found.sort((a,b)=>Number((b.release_date||'').startsWith('2026'))-Number((a.release_date||'').startsWith('2026')));setResults(found.slice(0,8))
      }catch(e){setResults([]);setError(e.message)}finally{setLoading(false)}
    },350)
    return ()=>clearTimeout(timer)
  },[query,token,active])
  useEffect(()=>{
    if(movieSearchFor===null||movieQuery.trim().length<2){setMovieResults([]);return}
    const timer=setTimeout(async()=>{
      setMovieLoading(true)
      try{
        if(!token){setMovieResults([]);return}
        const params=new URLSearchParams({query:movieQuery.trim(),include_adult:'false',language:'en-US',page:'1'})
        const res=await fetch(`https://api.themoviedb.org/3/search/movie?${params}`,{headers:{Authorization:`Bearer ${token}`,accept:'application/json'}})
        if(!res.ok) throw new Error('Could not search TMDB.')
        const data=await res.json()
        setMovieResults((data.results||[]).slice(0,6))
      }catch{
        setMovieResults([])
      }finally{
        setMovieLoading(false)
      }
    },300)
    return ()=>clearTimeout(timer)
  },[movieQuery,movieSearchFor,token])

  const add = item => {
    const isMovie=category.type==='movie'
    const entry={id:item.id,type:category.type,title:isMovie?(item.title||item.original_title):(item.name||item.original_name),year:isMovie?(item.release_date||'').slice(0,4):'',image:isMovie?item.poster_path:item.profile_path,knownFor:!isMovie?(item.known_for||[]).slice(0,2).map(x=>x.title||x.name).join(', '):'',movie:null,role:''}
    setPredictions(prev=>({...prev,[active]:[...(prev[active]||[]),entry]}));setQuery('');setResults([])
  }
  const remove=(id)=>setPredictions(p=>({...p,[active]:p[active].filter(x=>x.id!==id)}))
  const setAssociatedMovie=(id,movie)=>setPredictions(p=>({...p,[active]:p[active].map(x=>x.id===id?{...x,movie}:x)}))
  const selectAssociatedMovie=async (id,movie)=>{
    const title=movie.title||movie.original_title
    const year=movie.release_date?(movie.release_date.slice(0,4)):''
    const movieLabel=year?`${title} (${year})`:title
    setPredictions(p=>({...p,[active]:p[active].map(x=>x.id===id?{...x,movie:movieLabel,role:''}:x)}))
    setMovieSearchFor(null)
    setMovieQuery('')
    if(category.type==='person' && token){
      setRoleLoading(id)
      try{
        const params=new URLSearchParams({language:'en-US'})
        const res=await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?${params}`,{headers:{Authorization:`Bearer ${token}`,accept:'application/json'}})
        if(res.ok){
          const data=await res.json()
          const credit=(data.cast||[]).find(item=>item.id===movie.id)
          const role=credit?.character?.split(' / ')[0]?.trim()||''
          if(role){
            setPredictions(p=>({...p,[active]:p[active].map(x=>x.id===id?{...x,role}:x)}))
          }
        }
      }catch{
        // Keep the character field editable if TMDB does not provide a credit.
      }finally{
        setRoleLoading(null)
      }
    }
  }
  const setRole=(id,role)=>setPredictions(p=>({...p,[active]:p[active].map(x=>x.id===id?{...x,role}:x)}))
  const reorder=(from,to)=>{if(from===null||from===to)return;setPredictions(p=>{const arr=[...p[active]];const [item]=arr.splice(from,1);arr.splice(to,0,item);return {...p,[active]:arr}});setDragged(null)}
  const exportImage=(format)=>{
    const canvas=document.createElement('canvas')
    const width=1200
    const selected=CATEGORIES.filter(c=>!mainOnly||c.group==='Major')
    const rowHeight=72
    const height=230+(selected.length*rowHeight)
    canvas.width=width
    canvas.height=height
    const ctx=canvas.getContext('2d')
    ctx.fillStyle='#0d0d0d'
    ctx.fillRect(0,0,width,height)
    ctx.fillStyle='#d4af37'
    ctx.fillRect(0,0,width,8)
    ctx.fillStyle='#f4efe5'
    ctx.font='700 58px Georgia'
    ctx.fillText('THE OSCARS 2027',70,105)
    ctx.fillStyle='#c5a448'
    ctx.font='700 20px Arial'
    ctx.fillText('MY PREDICTIONS · 99TH EDITION',72,145)
    ctx.fillStyle='#777064'
    ctx.font='18px Arial'
    ctx.fillText(mainOnly?'Major categories only':'All categories',72,180)
    selected.forEach((c,index)=>{
      const y=210+(index*rowHeight)
      const winner=predictions[c.id]?.[0]
      ctx.fillStyle=index%2===0?'#171612':'#13130f'
      ctx.fillRect(70,y,width-140,rowHeight-10)
      ctx.fillStyle='#c5a448'
      ctx.font='700 16px Arial'
      ctx.fillText(c.name.toUpperCase(),95,y+33)
      ctx.fillStyle=winner?'#f4efe5':'#777064'
      ctx.font=winner?'600 22px Georgia':'18px Arial'
      ctx.textAlign='right'
      ctx.fillText(winner?(winner.movie&&winner.role?`${winner.title} — ${winner.movie}, as ${winner.role}`:winner.movie?`${winner.title} — ${winner.movie}`:winner.title+(winner.year?` (${winner.year})`:'')):'No prediction',width-95,y+35)
      ctx.textAlign='left'
    })
    ctx.fillStyle='#777064'
    ctx.font='16px Arial'
    ctx.fillText('This is your night. Make your call.',70,height-45)
    const mime=format==='jpg'?'image/jpeg':'image/png'
    const link=document.createElement('a')
    link.download=`oscars-2027-predictions.${format}`
    link.href=canvas.toDataURL(mime,0.94)
    link.click()
  }
  const summary=useMemo(()=>CATEGORIES.map(c=>{const winner=predictions[c.id]?.[0];const detail=winner?(winner.movie&&winner.role?`${winner.title} — ${winner.movie}, as ${winner.role}`:winner.movie?`${winner.title} — ${winner.movie}`:winner.role?`${winner.title} — as ${winner.role}`:winner.title+(winner.year?` (${winner.year})`:'')):'—';return `${c.name}: ${detail}`}).join('\n'),[predictions])
  const copySummary=async()=>{await navigator.clipboard.writeText(`MY PREDICTIONS · OSCARS 2027\n\n${summary}`);alert('Summary copied to the clipboard.')}

  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-btn" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Open menu"><Menu size={20}/></button>
      <div className="brand"><img className="header-logo" src="/media/oscars.png" alt="Oscar prediction app logo"/><div><div className="brand-name">OSCARS <span>2027</span></div><div className="brand-sub">MY PREDICTIONS · FAN EDITION</div></div></div>
      <div className="top-actions"><span className="edition-label">LOS ANGELES · 2027</span><span className="env-status"><span className={token?'status-dot on':'status-dot'}/>{token?'TMDB READY':'TMDB NOT CONFIGURED'}</span></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span></span> INDEPENDENT OSCAR PREDICTIONS</div><h1>Make your picks.<br/><em>Own the night.</em></h1><p>Build your prediction ballot. Choose your favorites and see who takes home the gold.</p><div className="hero-meta"><span><Clapperboard size={15}/> 2026 SEASON</span><span className="meta-dot">•</span><span>14 CATEGORIES</span></div></div>
        <div className="hero-art"><div className="art-glow"></div><img className="oscars-logo" src="/media/oscars.png" alt="Oscar prediction app logo"/><div className="art-caption">HOLLYWOOD <b>✦</b> CALIFORNIA</div></div>
        <div className="hero-bottom-line"></div>
      </section>
      <section className="stats-row"><div className="stat"><span className="stat-number">{String(filled).padStart(2,'0')}<small>/14</small></span><span className="stat-label">CATEGORIES FILLED</span></div><div className="stat"><span className="stat-number">{String(total).padStart(2,'0')}</span><span className="stat-label">NOMINEES SELECTED</span></div><div className="progress-wrap"><div className="progress-label"><span>YOUR PREDICTION PROGRESS</span><b>{Math.round(filled/CATEGORIES.length*100)}%</b></div><div className="progress-track"><div style={{width:`${filled/CATEGORIES.length*100}%`}}/></div></div></section>
      <div className="workspace">
        <aside className={`sidebar ${mobileMenu?'sidebar-open':''}`}><div className="side-heading">MY PREDICTIONS <span>2027</span></div><button className={`nav-item ${tab==='categories'?'selected':''}`} onClick={()=>{setTab('categories');setMobileMenu(false)}}><Film size={17}/> Categories <span className="nav-count">14</span></button><button className={`nav-item ${tab==='summary'?'selected':''}`} onClick={()=>{setTab('summary');setMobileMenu(false)}}><Trophy size={17}/> My ballot <span className="nav-count">{filled}</span></button><div className="side-divider"/><div className="side-heading muted">CATEGORIES</div><div className="category-nav">{['Major','Crafts'].map(group=><div key={group}><div className="group-label">{group}</div>{CATEGORIES.filter(c=>c.group===group).map(c=><button key={c.id} className={`category-link ${active===c.id&&tab==='categories'?'active':''}`} onClick={()=>{setActive(c.id);setTab('categories');setMobileMenu(false)}}><span className="category-dot"/>{c.name}<span className="category-progress">{predictions[c.id]?.length||0}</span></button>)}</div>)}</div><div className="sidebar-footer"><div className="api-status"><span className={token?'status-dot on':'status-dot'}/>{token?'TMDB CONNECTED':'TMDB NOT CONFIGURED'}</div><span>MOVIE DATA · TMDB</span></div></aside>
        <section className="content-area">{tab==='categories'?<>
          <div className="section-top"><div><div className="eyebrow">{category.group.toUpperCase()}</div><h2>{category.name}</h2><p className="section-desc">Select up to {category.limit} nominees and rank them by your prediction.</p></div><div className="limit-pill">{predictions[active]?.length||0} <span>/ {category.limit}</span></div></div>
          <div className="search-panel"><div className="search-title"><div className="search-icon"><Search size={18}/></div><div><b>Explore TMDB</b><span>{category.type==='movie'?'Search movies for this category':'Search actors or filmmakers'}</span></div></div><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={category.type==='movie'?'Search a movie...':'Search a person...'} /><kbd>TMDB</kbd></div>
            {query.trim().length>=2&&<div className="search-results">{loading?<div className="search-message">Searching The Movie Database...</div>:error?<div className="search-message error">{error}</div>:results.length?results.map(item=>{const isMovie=category.type==='movie';const title=isMovie?(item.title||item.original_title):(item.name||item.original_name);const img=isMovie?item.poster_path:item.profile_path;const exists=predictions[active].some(x=>x.id===item.id);return <div className="result-row" key={item.id}><div className="result-image">{img?<img src={IMAGE+'w92'+img} alt=""/>:<Film size={18}/>}</div><div className="result-info"><b>{title}</b><span>{isMovie?(item.release_date||'').slice(0,4):((item.known_for||[]).map(x=>x.title||x.name).slice(0,2).join(' · ')||'Film professional')}</span></div><button className="add-result" disabled={exists||predictions[active].length>=category.limit} onClick={()=>add(item)}>{exists?<Check size={16}/>:<Plus size={16}/>}<span>{exists?'Added':'Add'}</span></button></div>}):<div className="search-message">No results found.</div>}</div>}
            <div className="search-hint">{category.type==='movie'?'Results are prioritized by 2026 releases.':'After adding a person, search TMDB for their nominated movie and role.'}</div>
          </div>
          <div className="nominees-header"><div><h3>YOUR NOMINEES</h3><span>Drag to change prediction order</span></div><span className="sort-label"><GripVertical size={14}/> FAVORITE ORDER</span></div>
          <div className="nominee-list">
            {predictions[active].length===0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Star size={25}/></div>
                <b>Your category is waiting for nominees</b>
                <span>Use search to add your 2026 favorites.</span>
              </div>
            ) : predictions[active].map((item,index) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`nominee-card ${index===0?'winner-pick':''}`}
                draggable
                onDragStart={()=>setDragged(index)}
                onDragOver={e=>e.preventDefault()}
                onDrop={()=>reorder(dragged,index)}
                onDragEnd={()=>setDragged(null)}
              >
                <div className="drag-handle"><GripVertical size={17}/></div>
                <div className="rank">{String(index+1).padStart(2,'0')}</div>
                <div className="nominee-poster">
                  {item.image?<img src={IMAGE+'w185'+item.image} alt=""/>:<div className="poster-placeholder"><Film size={22}/></div>}
                </div>
                <div className="nominee-details">
                  <b>{item.title}</b>
                  <span>{item.year||item.knownFor||'No additional information'}</span>
                  {item.type==='person' && (
                    <div className="person-selection">
                      <button
                        className="movie-picker"
                        onClick={()=>{setMovieSearchFor(movieSearchFor===item.id?null:item.id);setMovieQuery(item.movie||'')}}
                      >
                        <Film size={13}/>
                        {item.movie?`In ${item.movie}`:'Search nominated movie'}
                      </button>
                      <input
                        className="associated-movie"
                        value={item.role||''}
                        onChange={e=>setRole(item.id,e.target.value)}
                        placeholder={roleLoading===item.id?'Loading character...':'Character name (optional)'}
                      />
                      {movieSearchFor===item.id && (
                        <div className="movie-search">
                          <div className="search-box compact">
                            <Search size={15}/>
                            <input
                              value={movieQuery}
                              onChange={e=>setMovieQuery(e.target.value)}
                              placeholder="Search TMDB movies..."
                            />
                          </div>
                          {movieLoading ? (
                            <div className="search-message">Searching...</div>
                          ) : movieResults.map(movie => (
                            <button
                              key={movie.id}
                              className="movie-result"
                              onClick={()=>selectAssociatedMovie(item.id,movie)}
                            >
                              {movie.title||movie.original_title}
                              <span>{(movie.release_date||'').slice(0,4)||'Unknown year'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {index===0 && (
                    <span className="winner-tag"><Trophy size={11}/> WINNER PREDICTION</span>
                  )}
                </div>
                <button className="remove-btn" onClick={()=>remove(item.id)} aria-label="Remove"><X size={17}/></button>
              </div>
            ))}
          </div>
          <div className="category-footer"><span><Sparkles size={14}/> {category.limit-predictions[active].length} slots available</span><div className="category-arrows"><button disabled={CATEGORIES.findIndex(c=>c.id===active)===0} onClick={()=>setActive(CATEGORIES[CATEGORIES.findIndex(c=>c.id===active)-1].id)}>Previous</button><button disabled={CATEGORIES.findIndex(c=>c.id===active)===CATEGORIES.length-1} onClick={()=>setActive(CATEGORIES[CATEGORIES.findIndex(c=>c.id===active)+1].id)}>Next category <ChevronDown size={14}/></button></div></div>
        </>:<>
          <div className="section-top summary-top"><div><div className="eyebrow">YOUR OSCAR NIGHT</div><h2>My predictions <em>2027</em></h2><p className="section-desc">Your picks for the 99th Academy Awards.</p></div><div className="limit-pill">{filled} <span>/ 14</span></div></div>
          <div className="export-options"><label className="category-toggle"><input type="checkbox" checked={mainOnly} onChange={e=>setMainOnly(e.target.checked)}/><span>Major categories only</span></label><div className="summary-actions"><button className="gold-button" onClick={()=>exportImage('jpg')}><Download size={16}/> Download JPG</button><button className="outline-button" onClick={()=>exportImage('png')}><Download size={16}/> Download PNG</button><button className="outline-button" onClick={copySummary}><Copy size={16}/> Copy list</button></div></div>
          <div className="summary-grid">{CATEGORIES.filter(c=>!mainOnly||c.group==='Major').map(c=>{const winner=predictions[c.id]?.[0];const nomineeLabel=winner?(winner.movie&&winner.role?`In ${winner.movie} as ${winner.role}`:winner.movie?`In ${winner.movie}`:winner.role?`as ${winner.role}`:winner.year||winner.knownFor||'Winner prediction'):'No prediction yet';return <div className="summary-card" key={c.id}><div className="summary-card-top"><span>{c.group.toUpperCase()}</span><span>{winner?'01':'—'}</span></div><b>{c.name}</b><div className="summary-winner">{winner?<><div className="mini-image">{winner.image?<img src={IMAGE+'w92'+winner.image} alt=""/>:<Film size={16}/>}</div><div><strong>{winner.title}</strong><small>{nomineeLabel}</small></div><Trophy className="mini-trophy" size={16}/></>:<span className="not-selected">No prediction yet</span>}</div></div>})}</div>
          <div className="export-note"><Award size={19}/><div><b>Your ballot is ready for the ceremony.</b><span>Download a JPG or PNG, or copy the complete list to share it.</span></div></div>
        </>}</section>
      </div>
    </main>
    <footer className="footer"><span>CREATED BY <a href="https://github.com/DavidFerreiro-dev" target="_blank" rel="noreferrer">DAVID FERREIRO</a></span><span>INDEPENDENT FAN PROJECT · NOT AFFILIATED WITH THE ACADEMY</span><span>POWERED BY <b>TMDB</b></span></footer>
  </div>
}
export default App
