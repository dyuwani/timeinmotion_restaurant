/* ═══════════════════════════════════════════════════════
   SHARED STEP DEFINITIONS
   Single source of truth for both index.html (the tracker) and
   report.html (the saved-sessions report) — loaded via <script src>
   before either page's own inline script.
═══════════════════════════════════════════════════════ */
const TYPE_COLORS = { setup:"#6E56F8",order:"#3B82F6",fire:"#FF6B2B",serve:"#10B981",clear:"#64748B",payment:"#F59E0B",close:"#EF4444" };
const TYPE_LABELS = { setup:"Setup",order:"Order",fire:"🔥 Fire",serve:"🍽️ Serve",clear:"↩ Clear",payment:"Payment",close:"Close" };
const PHASE_LABELS = { setup:"Open",order:"Order",service:"Service",payment:"Payment",close:"Close" };

const FINEDINING_GROUPS = [
  { id:"setup",label:"Table Setup",icon:"🪑",color:"#6E56F8",steps:[
    {id:1,step:"Guest Seated",activity:"Table Opened / Cover Set",type:"setup",optional:false},
    {id:2,step:"Menus Presented",activity:"Menu Handover",type:"setup",optional:false},
    {id:3,step:"Water Service",activity:"Water Poured",type:"serve",optional:true},
  ]},
  { id:"order",label:"Order Phase",icon:"📋",color:"#3B82F6",steps:[
    {id:4,step:"Aperitif Order Taken",activity:"Beverage Order Encoded",type:"order",optional:true},
    {id:5,step:"Aperitif Served",activity:"Beverages Delivered",type:"serve",optional:true},
    {id:6,step:"Food Order Taken",activity:"Course Order Encoded",type:"order",optional:false},
    {id:7,step:"Order Submitted",activity:"ECR → POS",type:"order",optional:false},
    {id:8,step:"Order Acknowledged",activity:"Kitchen / POS Confirmed",type:"order",optional:false},
  ]},
  { id:"amuse",label:"Amuse-Bouche",icon:"✨",color:"#FF6B2B",steps:[
    {id:9,step:"FIRE: Amuse-Bouche",activity:"Kitchen Instruction",type:"fire",optional:true,fireId:"amuse"},
    {id:10,step:"Amuse-Bouche Served",activity:"Course Delivered",type:"serve",optional:true,serveId:"amuse"},
  ]},
  { id:"bread",label:"Bread Service",icon:"🍞",color:"#C4A052",steps:[
    {id:11,step:"FIRE: Bread & Butter",activity:"Bread Station Fired",type:"fire",optional:true,fireId:"bread"},
    {id:12,step:"Bread Service",activity:"Bread & Butter Delivered",type:"serve",optional:true,serveId:"bread"},
  ]},
  { id:"starter",label:"Starter / First Course",icon:"🔥",color:"#FF6B2B",steps:[
    {id:13,step:"FIRE: Starter",activity:"Kitchen Instruction",type:"fire",optional:false,fireId:"starter"},
    {id:14,step:"Starter Served",activity:"Course Delivered",type:"serve",optional:false,serveId:"starter"},
    {id:15,step:"Starter Cleared",activity:"Plates Removed",type:"clear",optional:false},
  ]},
  { id:"intermezzo",label:"Intermezzo",icon:"❄️",color:"#A78BFA",steps:[
    {id:16,step:"Intermezzo / Sorbet",activity:"Palate Cleanser Delivered",type:"serve",optional:true},
  ]},
  { id:"main",label:"Main Course",icon:"🔥",color:"#FF6B2B",steps:[
    {id:17,step:"FIRE: Main Course",activity:"Kitchen Instruction",type:"fire",optional:false,fireId:"main"},
    {id:18,step:"Main Course Served",activity:"Course Delivered",type:"serve",optional:false,serveId:"main"},
    {id:19,step:"Main Plates Cleared",activity:"Plates Removed",type:"clear",optional:false},
  ]},
  { id:"cheese",label:"Cheese Course",icon:"🧀",color:"#D4A843",steps:[
    {id:20,step:"FIRE: Cheese Course",activity:"Kitchen Instruction",type:"fire",optional:true,fireId:"cheese"},
    {id:21,step:"Cheese Course Served",activity:"Course Delivered",type:"serve",optional:true,serveId:"cheese"},
    {id:22,step:"Cheese Cleared",activity:"Plates Removed",type:"clear",optional:true},
  ]},
  { id:"dessert",label:"Dessert",icon:"🔥",color:"#FF6B2B",steps:[
    {id:23,step:"FIRE: Dessert",activity:"Kitchen Instruction",type:"fire",optional:false,fireId:"dessert"},
    {id:24,step:"Dessert Served",activity:"Course Delivered",type:"serve",optional:false,serveId:"dessert"},
    {id:25,step:"Mignardises",activity:"Petits Fours Presented",type:"serve",optional:true},
  ]},
  { id:"payment",label:"Settlement",icon:"💳",color:"#F59E0B",steps:[
    {id:26,step:"Bill Requested",activity:"Generate Bill",type:"payment",optional:false},
    {id:27,step:"Bill Presented",activity:"Bill to Table",type:"payment",optional:false},
    {id:28,step:"Payment Initiated",activity:"Payment Processing",type:"payment",optional:false},
    {id:29,step:"Payment Completed",activity:"Approved / Declined",type:"payment",optional:false},
    {id:30,step:"Receipt Issued",activity:"Print / Digital Receipt",type:"payment",optional:false},
    {id:31,step:"Table Closed",activity:"Settlement / Turnover",type:"close",optional:false},
  ]},
];
const FINEDINING_FIRE_SERVE_PAIRS=[
  {label:"Amuse-Bouche",fireId:9,serveId:10},{label:"Bread",fireId:11,serveId:12},
  {label:"Starter",fireId:13,serveId:14},{label:"Main Course",fireId:17,serveId:18},
  {label:"Cheese",fireId:20,serveId:21},{label:"Dessert",fireId:23,serveId:24},
];

const CLUBS_GROUPS = [
  { id:"arrival",label:"Arrival & Seating",icon:"🚪",color:"#6E56F8",steps:[
    {id:1,step:"Group Arrival",activity:"Guest List Check-in",type:"setup",optional:false},
    {id:2,step:"Host Greeting",activity:"VIP Host Assigned",type:"setup",optional:true},
    {id:3,step:"Table/Booth Assigned",activity:"Table Allocation",type:"setup",optional:false},
  ]},
  { id:"order",label:"Order Phase",icon:"📋",color:"#3B82F6",steps:[
    {id:4,step:"Order Taken",activity:"Bottle/Drinks Order Encoded",type:"order",optional:false},
    {id:5,step:"Order Submitted",activity:"ECR → POS",type:"order",optional:false},
    {id:6,step:"Order Acknowledged",activity:"Bar / Stock Confirmed",type:"order",optional:false},
  ]},
  { id:"bottle",label:"Bottle Service",icon:"🍾",color:"#FF6B2B",steps:[
    {id:7,step:"FIRE: Bottle Prep",activity:"Bar Instruction",type:"fire",optional:false,fireId:"bottle"},
    {id:8,step:"Bottle Service Delivered",activity:"Sparkler Presentation / Delivered to Table",type:"serve",optional:false,serveId:"bottle"},
    {id:9,step:"Mixers & Garnish Set",activity:"Mixers / Ice / Garnish Arranged",type:"serve",optional:true},
  ]},
  { id:"reorder",label:"Additional Round",icon:"🔄",color:"#A78BFA",steps:[
    {id:10,step:"FIRE: Reorder",activity:"Bar Instruction",type:"fire",optional:true,fireId:"reorder"},
    {id:11,step:"Reorder Served",activity:"Round Delivered",type:"serve",optional:true,serveId:"reorder"},
  ]},
  { id:"payment",label:"Settlement",icon:"💳",color:"#F59E0B",steps:[
    {id:12,step:"Bill Requested",activity:"Generate Bill",type:"payment",optional:false},
    {id:13,step:"Bill Presented",activity:"Bill to Table",type:"payment",optional:false},
    {id:14,step:"Payment Initiated",activity:"Payment Processing",type:"payment",optional:false},
    {id:15,step:"Payment Completed",activity:"Approved / Declined",type:"payment",optional:false},
    {id:16,step:"Receipt Issued",activity:"Print / Digital Receipt",type:"payment",optional:false},
    {id:17,step:"Table Closed",activity:"Settlement / Turnover",type:"close",optional:false},
  ]},
];
const CLUBS_FIRE_SERVE_PAIRS=[
  {label:"Bottle Service",fireId:7,serveId:8},{label:"Reorder Round",fireId:10,serveId:11},
];

const USE_CASES = {
  finedining:{
    key:"finedining",label:"Fine Dining",icon:"🍽️",subtitle:"POS/ECR Service Flow",
    venues:["Medusa by Palace"],groups:FINEDINING_GROUPS,firePairs:FINEDINING_FIRE_SERVE_PAIRS,
    unitLabel:"Table",txLabel:"+ New Seating",fireBtnLabel:"🔥 Kitchen Times",fireSectionLabel:"🔥 Fire-to-Serve · Kitchen Execution Times",durationLabel:"Total Dining Duration",startLabel:"Seated At",
    chartColor:"#6E56F8",
  },
  clubs:{
    key:"clubs",label:"Clubs",icon:"🥂",subtitle:"VIP Table / Bottle Service Flow",
    venues:["Revel","Yes Please","The Clubhouse"],groups:CLUBS_GROUPS,firePairs:CLUBS_FIRE_SERVE_PAIRS,
    unitLabel:"Table",txLabel:"+ New Group",fireBtnLabel:"🍾 Bar Times",fireSectionLabel:"🍾 Fire-to-Serve · Bar Execution Times",durationLabel:"Total Visit Duration",startLabel:"Arrived At",
    chartColor:"#DB5B1F",
  },
};
// Fixed categorical order for venue charts — validated for CVD separation against a
// dark surface (see dataviz palette checks). Never reassign a venue a different slot.
const VENUE_COLORS = { "Revel":"#DB5B1F", "Yes Please":"#8B6EF0", "The Clubhouse":"#B8863A" };

function buildSteps(groups){return groups.flatMap(g=>g.steps.map(s=>({...s,group:g.id,groupLabel:g.label,groupColor:g.color,groupIcon:g.icon})));}

/* ── Shared formatting helpers (used by index.html and report.html) ── */
function fmtTime(d){if(!d)return"--:--:--";return(d instanceof Date?d:new Date(d)).toLocaleTimeString("en-PH",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});}
function fmtDur(ms){if(ms===null||ms===undefined||ms<0)return"--";const s=Math.floor(ms/1000),m=Math.floor(s/60),sec=s%60;if(m===0)return sec+"s";return m+"m "+String(sec).padStart(2,"0")+"s";}
function esc(str){return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
