// localStorage shim replacing deprecated WebSQL (removed in Chrome 2022)
(function(w){
  if(w.openDatabase)return;
  function gs(){try{return JSON.parse(localStorage.getItem('ae2db')||'{}')}catch(e){return{}}}
  function ss(s){try{localStorage.setItem('ae2db',JSON.stringify(s))}catch(e){}}
  function T(s){this.s=s;}
  T.prototype.executeSql=function(q,p,ok,er){
    var s=this.s,r={rows:{length:0,item:function(){return null;}}};
    try{
      q=q.trim();
      if(/^CREATE TABLE/i.test(q)){var m=q.match(/EXISTS (\w+)/i);if(m&&!s[m[1]])s[m[1]]=[];ss(s);return ok&&ok(this,r);}
      if(/^DROP TABLE/i.test(q)){var m=q.match(/EXISTS (\w+)/i);if(m)delete s[m[1]];ss(s);return ok&&ok(this,r);}
      if(/^INSERT/i.test(q)){
        var t=q.match(/INTO (\w+)/i)[1],c=q.match(/\(([^)]+)\)\s*values/i)[1].split(',').map(function(x){return x.trim();}),row={};
        c.forEach(function(k,i){row[k]=p[i];});if(!s[t])s[t]=[];s[t].push(row);ss(s);return ok&&ok(this,r);
      }
      if(/^DELETE/i.test(q)){
        var t=q.match(/FROM (\w+)/i)[1],wh=q.match(/WHERE (\w+)\s*=/i);
        if(s[t])s[t]=wh?s[t].filter(function(x){return x[wh[1]]!==p[0];}):[];ss(s);return ok&&ok(this,r);
      }
      if(/^SELECT/i.test(q)){
        var t=q.match(/FROM (\w+)/i)[1],rows=(s[t]||[]).slice(),wh=q.match(/WHERE (\w+)=\?/i);
        if(wh)rows=rows.filter(function(x){return x[wh[1]]===p[0];});
        if(/ORDER BY jsMapKey ASC/i.test(q))rows.sort(function(a,b){return a.jsMapKey>b.jsMapKey?1:-1;});
        if(/ORDER BY date DESC/i.test(q))rows.sort(function(a,b){return a.date<b.date?1:-1;});
        return ok&&ok(this,{rows:{length:rows.length,item:function(i){return rows[i];}}});
      }
    }catch(e){er&&er(this,e);}
  };
  function D(){this.s=gs();}
  D.prototype.transaction=D.prototype.readTransaction=function(cb,er,ok){
    var tx=new T(this.s);try{cb(tx);ss(tx.s);ok&&ok();}catch(e){er&&er(e);}
  };
  w.openDatabase=function(){return new D();};
}(window));
