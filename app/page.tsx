 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, CalendarDays, Check, CheckCircle2, ChevronDown, Circle,
  Clock3, Filter, LayoutDashboard, ListTodo, MoreHorizontal, Plus, Search,
  Settings2, Sparkles, Target, Trash2, X, ArrowUpRight, AlertCircle
} from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string; title: string; description: string; project: string;
  startDate: string; dueDate: string; priority: Priority; status: Status;
  progress: number; createdAt: string; updatedAt: string;
};

const STORAGE_KEY = "taskflow-tasks-v1";
const todayISO = () => {
  const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const sampleTasks: Task[] = [
  { id:"sample-1", title:"Prepare project proposal", description:"Outline the goals, scope, milestones, and expected outcomes.", project:"Work", startDate:todayISO(), dueDate:addDays(todayISO(),2), priority:"High", status:"In progress", progress:65, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"sample-2", title:"Review design feedback", description:"Go through comments and make the final refinements.", project:"Product", startDate:todayISO(), dueDate:addDays(todayISO(),4), priority:"Medium", status:"In progress", progress:35, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"sample-3", title:"Organise weekly notes", description:"Collect notes and update the shared workspace.", project:"Personal", startDate:todayISO(), dueDate:addDays(todayISO(),1), priority:"Low", status:"Not started", progress:0, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"sample-4", title:"Send monthly report", description:"Check the numbers and share the report with the team.", project:"Work", startDate:addDays(todayISO(),-4), dueDate:addDays(todayISO(),-1), priority:"High", status:"Completed", progress:100, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }
];
function addDays(date: string, n: number) { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function prettyDate(value: string) { if (!value) return "No date"; return new Date(`${value}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function dateDiff(a: string, b: string) { return Math.round((new Date(`${a}T12:00:00`).getTime()-new Date(`${b}T12:00:00`).getTime())/86400000); }

const emptyForm = {
  title:"", description:"", project:"General", startDate:todayISO(),
  dueDate:addDays(todayISO(),3), priority:"Medium" as Priority
};

export default function Home() {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [ready,setReady] = useState(false);
  const [activeTab,setActiveTab] = useState("All tasks");
  const [query,setQuery] = useState("");
  const [showModal,setShowModal] = useState(false);
  const [editing,setEditing] = useState<string|null>(null);
  const [form,setForm] = useState(emptyForm);
  const [notice,setNotice] = useState("");
  const [menuFor,setMenuFor] = useState<string|null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) : sampleTasks);
    } catch { setTasks(sampleTasks); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks)); },[tasks,ready]);

  const today = todayISO();
  const active = tasks.filter(t=>t.status!=="Completed");
  const completed = tasks.filter(t=>t.status==="Completed");
  const overdue = active.filter(t=>t.dueDate && t.dueDate<today);
  const dueSoon = active.filter(t=>t.dueDate && t.dueDate>=today && dateDiff(t.dueDate,today)<=3);
  const overall = tasks.length ? Math.round(tasks.reduce((sum,t)=>sum+t.progress,0)/tasks.length) : 0;

  const visibleTasks = useMemo(() => tasks.filter(t => {
    const matches = `${t.title} ${t.description} ${t.project}`.toLowerCase().includes(query.toLowerCase());
    const tabMatch = activeTab==="All tasks" || (activeTab==="In progress" && t.status==="In progress") ||
      (activeTab==="Completed" && t.status==="Completed") || (activeTab==="Upcoming" && t.status!=="Completed" && t.dueDate>=today);
    return matches && tabMatch;
  }).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)),[tasks,query,activeTab,today]);

  function openNew() { setEditing(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(task:Task) {
    setEditing(task.id); setForm({title:task.title,description:task.description,project:task.project,startDate:task.startDate,dueDate:task.dueDate,priority:task.priority}); setShowModal(true); setMenuFor(null);
  }
  function saveTask(e:React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    if (editing) setTasks(prev=>prev.map(t=>t.id===editing?{...t,...form,title:form.title.trim(),updatedAt:now}:t));
    else setTasks(prev=>[{...form,id:crypto.randomUUID(),title:form.title.trim(),status:"Not started",progress:0,createdAt:now,updatedAt:now},...prev]);
    setShowModal(false); setNotice(editing?"Task updated":"Task created"); window.setTimeout(()=>setNotice(""),2400);
  }
  function updateProgress(task:Task,value:number) {
    const progress=Math.max(0,Math.min(100,value));
    const status:Status=progress===100?"Completed":progress===0?"Not started":"In progress";
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,progress,status,updatedAt:new Date().toISOString()}:t));
  }
  function changeStatus(task:Task,status:Status) {
    const progress=status==="Completed"?100:status==="Not started"?0:Math.max(10,task.progress);
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,status,progress,updatedAt:new Date().toISOString()}:t));
    setMenuFor(null);
  }
  function deleteTask(id:string) { setTasks(prev=>prev.filter(t=>t.id!==id)); setMenuFor(null); }
  function resetDemo() { if(confirm("Reset to the sample tasks? This replaces your current tasks.")){setTasks(sampleTasks);setNotice("Sample tasks restored");window.setTimeout(()=>setNotice(""),2400);} }

  if (!ready) return <main className="loading">Loading your workspace…</main>;

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Check size={19}/></div><span>taskflow</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">
        <button className="nav-item selected"><LayoutDashboard size={18}/> Overview</button>
        <button className={`nav-item ${activeTab==="All tasks"?"":" "}`} onClick={()=>setActiveTab("All tasks")}><ListTodo size={18}/> All tasks <span className="nav-count">{tasks.length}</span></button>
        <button className="nav-item" onClick={()=>setActiveTab("Upcoming")}><CalendarDays size={18}/> Upcoming</button>
        <button className="nav-item" onClick={()=>setActiveTab("In progress")}><Activity size={18}/> In progress</button>
        <button className="nav-item" onClick={()=>setActiveTab("Completed")}><CheckCircle2 size={18}/> Completed</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16}/></div><strong>Small steps add up.</strong><p>Keep moving forward, one task at a time.</p></div>
        <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><span>Personal plan</span></div><MoreHorizontal size={18} className="profile-more"/></div>
      </div>
    </aside>

    <section className="main-area">
      <header className="topbar">
        <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
        <div className="top-actions"><span className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span><button className="icon-button" title="Updates are shown in the overview"><Bell size={18}/>{overdue.length>0&&<i/>}</button><div className="avatar small">Y</div></div>
      </header>

      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">YOUR PRODUCTIVITY, AT A GLANCE</div><h1>Good things happen<br className="mobile-break"/> when you make a plan<span>.</span></h1><p className="subheading">A clear view of what matters today.</p></div><button className="primary-button" onClick={openNew}><Plus size={18}/> New task</button></div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>Total tasks</span><div className="stat-icon purple"><ListTodo size={17}/></div></div><div className="stat-value">{tasks.length}<small> tasks</small></div><div className="stat-foot">Across your workspace</div></div>
          <div className="stat-card"><div className="stat-top"><span>In progress</span><div className="stat-icon blue"><Activity size={17}/></div></div><div className="stat-value">{active.filter(t=>t.status==="In progress").length}<small> active</small></div><div className="stat-foot">Work currently underway</div></div>
          <div className="stat-card"><div className="stat-top"><span>Completed</span><div className="stat-icon green"><CheckCircle2 size={17}/></div></div><div className="stat-value">{completed.length}<small> done</small></div><div className="stat-foot">Tasks across the finish line</div></div>
          <div className="stat-card"><div className="stat-top"><span>Overdue</span><div className="stat-icon orange"><AlertCircle size={17}/></div></div><div className="stat-value">{overdue.length}<small> need attention</small></div><div className="stat-foot">{dueSoon.length} due in the next 3 days</div></div>
        </div>

        <div className="overview-grid">
          <section className="panel progress-panel">
            <div className="panel-heading"><div><div className="eyebrow">YOUR MOMENTUM</div><h2>Overall progress</h2></div><span className="subtle-pill"><Target size={14}/> All tasks</span></div>
            <div className="progress-main"><div className="progress-number">{overall}<span>%</span></div><div className="progress-copy"><strong>{overall>=75?"You're on a roll!":overall>=40?"Good progress so far.":"Every task starts somewhere."}</strong><p>Your average completion across all tasks.</p></div></div>
            <div className="big-track"><div style={{width:`${overall}%`}}/></div>
            <div className="progress-legend"><span><i className="dot purple-dot"/> {completed.length} completed</span><span><i className="dot grey-dot"/> {active.length} remaining</span></div>
          </section>
          <section className="panel attention-panel">
            <div className="panel-heading"><div><div className="eyebrow">STAY AHEAD</div><h2>Needs attention</h2></div><span className="attention-count">{overdue.length+dueSoon.length}</span></div>
            {overdue.length===0&&dueSoon.length===0?<div className="empty-attention"><div className="calm-icon"><CheckCircle2 size={22}/></div><strong>You're all caught up</strong><p>No overdue tasks or deadlines in the next three days.</p></div>:<div className="attention-list">{[...overdue,...dueSoon].slice(0,3).map(t=><div className="attention-item" key={t.id}><div className={`attention-marker ${t.dueDate<today?"late":""}`}/><div className="attention-text"><strong>{t.title}</strong><span>{t.dueDate<today?"Overdue":`Due ${prettyDate(t.dueDate)}`}</span></div><span className="attention-project">{t.project}</span></div>)}</div>}
          </section>
        </div>

        <section className="panel tasks-panel">
          <div className="tasks-heading"><div><div className="eyebrow">MAKE IT HAPPEN</div><h2>Your tasks <span className="task-total">{visibleTasks.length}</span></h2></div><div className="task-tools"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks…"/></div><button className="filter-button" onClick={()=>setActiveTab("All tasks")}><Filter size={15}/> <span>{activeTab}</span><ChevronDown size={14}/></button></div></div>
          <div className="tabs">{["All tasks","Upcoming","In progress","Completed"].map(tab=><button key={tab} className={activeTab===tab?"tab active-tab":"tab"} onClick={()=>setActiveTab(tab)}>{tab}</button>)}</div>
          {visibleTasks.length===0?<div className="empty-state"><div className="empty-icon"><ListTodo size={24}/></div><strong>No tasks here yet</strong><p>Add a task or change your search to see more.</p><button className="text-button" onClick={openNew}><Plus size={15}/> Create a task</button></div>:<div className="task-list">
            {visibleTasks.map(task=><article className="task-row" key={task.id}>
              <button className={`task-check ${task.status==="Completed"?"checked":""}`} onClick={()=>changeStatus(task,task.status==="Completed"?"Not started":"Completed")} aria-label="Toggle completed">{task.status==="Completed"?<Check size={14}/>:<Circle size={17}/>}</button>
              <div className="task-info"><div className="task-title-line"><strong className={task.status==="Completed"?"done-title":""}>{task.title}</strong><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description||"No description added."}</p><div className="task-meta"><span className="project-tag">{task.project}</span><span className={task.dueDate<today&&task.status!=="Completed"?"due late-text":"due"}><CalendarDays size={13}/>{prettyDate(task.dueDate)}</span><span className="status-label">{task.status}</span></div></div>
              <div className="task-progress"><div className="progress-label"><span>Progress</span><strong>{task.progress}%</strong></div><input aria-label={`Progress for ${task.title}`} type="range" min="0" max="100" step="5" value={task.progress} onChange={e=>updateProgress(task,Number(e.target.value))}/><div className="mini-track"><div style={{width:`${task.progress}%`}}/></div></div>
              <div className="task-menu-wrap"><button className="more-button" onClick={()=>setMenuFor(menuFor===task.id?null:task.id)} aria-label="Task options"><MoreHorizontal size={19}/></button>{menuFor===task.id&&<div className="dropdown"><button onClick={()=>openEdit(task)}><Settings2 size={14}/> Edit task</button><button onClick={()=>deleteTask(task.id)} className="delete-option"><Trash2 size={14}/> Delete</button></div>}</div>
            </article>)}
          </div>}
          <div className="tasks-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><button onClick={resetDemo}>Reset sample data</button></div>
        </section>
        <footer className="footer"><span>Made for focused days.</span><span>Taskflow <b>·</b> Your personal workspace</span></footer>
      </div>
    </section>

    {showModal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowModal(false);}}><form className="modal" onSubmit={saveTask}>
      <div className="modal-heading"><div><div className="eyebrow">{editing?"KEEP IT CURRENT":"GET IT OUT OF YOUR HEAD"}</div><h2>{editing?"Edit task":"Create a task"}</h2></div><button type="button" className="icon-button" onClick={()=>setShowModal(false)}><X size={18}/></button></div>
      <label>Task name <input required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Finish project proposal"/></label>
      <label>Description <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a few details…" rows={3}/></label>
      <div className="form-two"><label>Project / category <input value={form.project} onChange={e=>setForm({...form,project:e.target.value})} placeholder="General"/></label><label>Priority <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
      <div className="form-two"><label>Start date <input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label><label>Due date <input type="date" min={form.startDate} value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label></div>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16}/>{editing?"Save changes":"Create task"}</button></div>
    </form></div>}
    {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
  </main>;
}
