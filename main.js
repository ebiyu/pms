const bitPerBeat=4;
const bitPerBar=16;

var LongNotesError=false;

var activeRow=0; //選択中の行の概念

var saved=true;

function initTable(){
    var table=document.createElement('table');
    table.id='table';
    document.getElementById('tablespace').appendChild(table);
}
function refreshTable(){
    var rows=[];
    var table=document.getElementById('table');

    searchLonNote();

    len=table.rows.length
    for(i=0;i<len;++i){
        table.deleteRow(0);
    }

    //ヘッダ追加
    head=table.insertRow(-1);
    for(i=0;i<11;++i){
        thObj=document.createElement('th');
        if(i==0){
            thObj.innerHTML=''
        }else if(i<10){
            thObj.innerHTML=i
        }
        head.appendChild(thObj);
    }

    //データ追加
    for(i=0;i<data.length;++i){
        rows.push(table.insertRow(-1));
        
        //小説数を示す列
        if(i%bitPerBar==0){
            cell=rows[i].insertCell(-1);
            cell.innerHTML=i/bitPerBar;
            cell.rowSpan=bitPerBar;
            cell.classList.add('frame_start');
            cell.classList.add('frame_count');
            cell.onclick=function(e){activateRow(e);}
        }

        //ノーツの列の作成
        for(j=0;j<data[0].length;++j){
            cell=rows[i].insertCell(-1);

            //ノーツの種類を判定
            if(data[i][j]==1){
                cell.classList.add('note');
            }else if(data[i][j]==2){
                cell.classList.add('lnote');
            }else if(data[i][j]==3){
                cell.classList.add('inlnote');
            }else if(dragging && j==dragCol){
                if(i==dragStart || i==dragEnd){
                    cell.classList.add('lnote');
                }else if((i>dragStart && i<dragEnd) || (i<dragStart && i>dragEnd)){
                    cell.classList.add('inlnote');
                }
            }

            //アクティブ行の判定
            if(i==activeRow){
                cell.classList.add('active');
            }

            //小節制御
            if(i%bitPerBar==0){
                cell.classList.add('frame_start');
            }else if(i%bitPerBeat==0){
                cell.classList.add('beat');
            }

            //イベントを設定
            cell.onclick=function(e){cellClick(e);};
            cell.oncontextmenu=function(e){cellRClick(e)}
            cell.onmousemove=function(e){cellMouseMove(e)}
        }

        //ボタンを追加する列
        if(i%bitPerBar==0){
            cell=rows[i].insertCell(-1);
            cell.innerHTML=
                "<input type='button' onclick='addLine(this)' value='add'><br>"
                +"<input type='button' onclick='clearLine(this)' value='clear'>"
                +"<input type='button' onclick='deleteLine(this)' value='delete'>"
            cell.rowSpan=bitPerBar;
            cell.classList.add('frame_start');
            cell.classList.add('frame_count');
        }
    }
}
function edit(){
    //undo関係の処理をここに書く

    saved=false;
}
function checkScroll(){
    var row=document.getElementById('table').rows[activeRow+1];
    var pos=row.getBoundingClientRect().top;
    var winsize=window.innerHeight;
    var cellsize=row.offsetHeight;

    const mergin=100;

    //画面の上にある場合
    if(pos-mergin<0){
        window.scrollBy(0,pos-mergin);
    }
    //画面の下にある場合
    if(pos+cellsize+mergin>winsize){
        window.scrollBy(0,pos+cellsize+mergin-winsize);
    }
}
function searchLonNote(){
    LongNotesError=false;
    for(col=0;col<9;++col){
        inLongNote=false;
        for(i=0;i<data.length;++i){
            if(inLongNote){
                if(data[i][col]==2){
                    inLongNote=false;
                }else if(data[i][col]==1){
                    LongNotesError=true;
                }else if(data[i][col]!=1){
                    data[i][col]=3;
                }
            }else{
                if(data[i][col]==2){
                    inLongNote=true;
                }else if(data[i][col]!=1){
                    data[i][col]=0;
                }
            }
            if(i==data.length-1 && inLongNote){
                LongNotesError=true;
            }
        }
    }
}

function getIndex(obj){
    if(obj.classList.contains('frame_start')){
        return [obj.parentNode.rowIndex-1,obj.cellIndex-1];
    }else{
        return [obj.parentNode.rowIndex-1,obj.cellIndex];
    }
}

function cellClick(e){
    [i,j]=getIndex(e.target);
    if(data[i][j]==1){
        data[i][j]=0;
    }else{
        data[i][j]=1;
    }
    edit();
    activeRow=i;
    refreshTable();
}
var dragStart=0;
var dragCol=0;
var dragEnd=0;
var dragging=false;
function cellRClick(e){
    e.preventDefault();
    if(!dragging){
        [i,j]=getIndex(e.target);
        dragStart=i;
        dragEnd=i;
        dragCol=j;
        dragging=true;
    }else{
        [i,j]=getIndex(e.target);
        dragEnd=i;
        if(dragStart!=i){
            if(data[dragStart][dragCol]==2){
                data[dragStart][dragCol]=0;
            }else{
                data[dragStart][dragCol]=2;
            }
            if(data[i][dragCol]==2){
                data[i][dragCol]=0;
            }else{
                data[i][dragCol]=2;
            }
            edit();
        }
        dragging=false;
    }
    activeRow=i;
    refreshTable();
}
function cellMouseMove(e){
    [i,j]=getIndex(e.target);
    if(dragging){
        dragEnd=i;
        refreshTable();
    }
}

function activateRow(e){
    [i,j]=getIndex(e.target);
    activeRow=i;
    refreshTable();
}

window.onkeypress=function(e){
    col=-1;
    switch(e.key){
        case 'j':
            activeRow=Math.min(data.length-1,activeRow+1);
            refreshTable();
            checkScroll();
            break;
        case 'J':
            activeRow=Math.min(data.length-1,activeRow+bitPerBar);
            refreshTable();
            checkScroll();
            break;
        case 'k':
            activeRow=Math.max(0,activeRow-1);
            refreshTable();
            checkScroll();
            break;
        case 'K':
            activeRow=Math.max(0,activeRow-bitPerBar);
            refreshTable();
            checkScroll();
            break;
        case 'Enter':
            if(e.shiftKey){
                if(activeRow>0){
                    activeRow-=1;
                }
            }else{
                if(activeRow<data.length-1){
                    activeRow+=1;
                }
            }
            checkScroll();
            refreshTable();
            break;
        case '1':
        case 'z':
            if(col==-1) col=0;
        case '2':
        case 'x':
            if(col==-1) col=1;
        case '3':
        case 'c':
            if(col==-1) col=2;
        case '4':
        case 'v':
            if(col==-1) col=3;
        case '5':
        case ' ':
            if(col==-1){
                col=4;
                e.preventDefault();
            }
        case '6':
        case 'n':
            if(col==-1) col=5;
        case '7':
        case 'm':
            if(col==-1) col=6;
        case '8':
        case ',':
            if(col==-1) col=7;
        case '9':
        case '.':
            if(col==-1) col=8;
            if(data[activeRow][col]==1){
                data[activeRow][col]=0;
            }else{
                data[activeRow][col]=1;
            }
            edit();
            refreshTable();
            break;
        case 'Backspace':
        case 'S':
        case 's':
            data[activeRow]=[0,0,0,0,0,0,0,0,0];
            edit();
            refreshTable();
            break;
        case 'd':
            i=Math.floor(activeRow/bitPerBar)*bitPerBar;
            data.splice(i,bitPerBar);
            edit();
            refreshTable();
            break;
        case 'o':
            i=Math.floor(activeRow/bitPerBar+1)*bitPerBar;
            len=bitPerBar;
            for(c=0;c<len;++c){
                data.splice(i,0,[0,0,0,0,0,0,0,0,0]);
            }
            edit();
            refreshTable();
            break;
        case 'O':
            i=Math.floor(activeRow/bitPerBar)*bitPerBar;
            len=bitPerBar;
            for(c=0;c<len;++c){
                data.splice(i,0,[0,0,0,0,0,0,0,0,0]);
            }
            edit();
            refreshTable();
            break;
        case 'g':
            activeRow=0;
            refreshTable();
            break;
        case 'G':
            activeRow=data.length-1;
            refreshTable();
            break;
    }
}

function addLine(obj){
    [i,j]=getIndex(obj.parentNode);
    len=bitPerBar;
    for(c=0;c<len;++c){
        data.splice(i,0,[0,0,0,0,0,0,0,0,0]);
    }
    edit();
    refreshTable();
}
function clearLine(obj){
    [i,j]=getIndex(obj.parentNode);
    len=bitPerBar;
    for(c=0;c<len;++c){
        data[i+c]=[0,0,0,0,0,0,0,0,0];
    }
    refreshTable();
    edit();
}
function deleteLine(obj){
    [i,j]=getIndex(obj.parentNode);
    data.splice(i,bitPerBar);
    edit();
    refreshTable();
}

function addFrame(n){
    for(i=0;i<n*bitPerBar;++i){
        data.push([0,0,0,0,0,0,0,0,0]);
    }
}

function save(){
    if(LongNotesError){
        window.alert('ロングノーツの配置に問題があります。\n修正してから再度操作してください。');
        return;
    }

    text='';

    //ヘッダー
    text+='#PLAYER 3\n';
    text+='#GENRE \n';
    text+='#TITLE \n';
    text+='#ARTIST \n';
    text+='#BPM '+document.getElementById('bpm').value+'\n';
    text+='#PLAYLEVEL 1\n';
    text+='#RANK 3\n';
    text+='#STAGEFILE \n';

    //内容作成
    notes=[];
    for(bar=0;bar<data.length/bitPerBar;++bar){
        for(col=0;col<9;++col){
            ch=[11,12,13,14,15,22,23,24,25][col];
            note=[];
            hstr='#'+('000'+bar).slice(-3)+('00'+ch).slice(-2)+':';
            notestr='';
            lnotestr='';
            notef=false;
            lnotef=false;
            for(i=0;i<bitPerBar;++i){
                if(data[bar*bitPerBar+i][col]==1){
                    notestr+='01';
                    notef=true;
                }else{
                    notestr+='00';
                }
                if(data[bar*bitPerBar+i][col]==2){
                    lnotestr+='01';
                    lnotef=true;
                }else{
                    lnotestr+='00';
                }
            }
            if(notef){
                text+='#'+('000'+bar).slice(-3)+('00'+ch).slice(-2)+':'+notestr+'\n';
            }
            if(lnotef){
                text+='#'+('000'+bar).slice(-3)+('00'+(ch+40)).slice(-2)+':'+lnotestr+'\n';
            }
        }
    }

    //ファイルに出力
    var downLoadLink = document.createElement("a");
    downLoadLink.download=document.getElementById('filename').value;
    downLoadLink.href = URL.createObjectURL(new Blob([text], {type: "text.plain"}));
    downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
    downLoadLink.click();

    saved=true;
}

function load(obj){
    if(!saved){
        if(!confirm('この操作を実行すると，保存されていない変更は失われます。\nよろしいですか？')) return;
    }
    //dataをクリアする
    data=[];
    addFrame(4);

    bpm=120; //デフォルト値

    //ファイルの読み込み
    var file=obj.files[0];
    var reader=new FileReader();

    //ファイル読み込み後の処理
    reader.onload=function(){
        text=reader.result;
        lines=text.split('\n');

        document.getElementById('filename').value=file.name;
        for(i=0;i<lines.length;++i){
            lines[i]=lines[i].trim(); //CRの除去のため

            //ファイルを解析する
            if(lines[i].substr(0,4)=="#BPM" && !isNaN(lines[i].substr(5))){
                bpm=Number(lines[i].substr(5));
            }else if(!isNaN(lines[i].substr(1,5))){
                bar=Number(lines[i].substr(1,3));
                ch=Number(lines[i].substr(4,2));
                d=[0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,0,0,0,0,0,0,5,6,7,8];
                if(ch>50){
                    col=d[ch-40];
                    type=2;
                }else{
                    col=d[ch];
                    type=1;
                }
                notestr=lines[i].substr(7);
                unit=bitPerBar*2/notestr.length;
                if(Number.isInteger(unit)){
                    //小節数が現在とどちらが多いか数える
                    if(bar+1>data.length/bitPerBar){
                        addFrame(bar+1-data.length/bitPerBar);
                    }
                    for(j=0;j<notestr.length/2;++j){
                        if(notestr.substr(j*2,2)!='00'){
                            data[bar*bitPerBar+j*unit][col]=type;
                        }
                    }
                }
            }
        }
        document.getElementById('bpm').value=bpm;
        refreshTable();
    }

    //ファイル読み込み実行
    reader.readAsText(file);

    obj.value='';

    saved=true;
}

function help(){
    text=['注意事項', '画面を閉じたり他のページに移動したりすると，保存してないデータは失われます。', '',
    'マウス操作', '左クリック ノーツ配置', '右クリック ロングノーツ配置', '',
    'ボタン操作', 'add 小節を追加', 'clear 小節内の音符を消去', 'delete 小節を削除', '',
    'キー操作', 'j / Enter 次の行へ', 'k / Shift+Enter 前の行へ', 'J 次の小節へ', 'K 前の小節へ',
    's 行をクリア', 'd 小節を削除', 'o 小節を後に挿入', 'O 小節を前に挿入',
    '1/z 2/x 3/c 4/v 5/space 6/n 7/m 8/, 9/, ノーツを作成/削除'].join('\n');
    window.alert(text);
}

//画面遷移を阻止する
window.onbeforeunload = function(e) {
    return 'ちょっと待ってくださいよ。まだダメですよ。';
};

data=[]
//4小節を追加する
addFrame(4);
//表の初期設定
initTable();
//表の描画
refreshTable();
