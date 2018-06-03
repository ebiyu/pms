const beatDelta=4;
const beatCount=4;

function initTable(){
    var table=document.createElement('table');
    table.id='table';
    document.getElementById('tablespace').appendChild(table);
}
function refreshTable(){
    var rows=[];
    var table=document.getElementById('table');

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
        if(i%(beatCount*beatDelta)==0){
            cell=rows[i].insertCell(-1);
            cell.innerHTML=i/(beatCount*beatDelta);
            cell.rowSpan=beatCount*beatDelta;
            cell.classList.add('frame_start');
            cell.classList.add('frame_count');
        }

        //ノーツの列の作成
        for(j=0;j<data[0].length;++j){
            cell=rows[i].insertCell(-1);

            //ノーツの種類を判定
            if(data[i][j]==1){
                cell.classList.add('note');
            }else if(data[i][j]==2){
                cell.classList.add('lnote');
            }

            //小節制御
            if(i%(beatCount*beatDelta)==0){
                cell.classList.add('frame_start');
            }else if(i%beatDelta==0){
                cell.classList.add('beat');
            }

            //イベントを設定
            cell.onclick=function(e){cellClick(e);};
            cell.oncontextmenu=function(e){cellRClick(e)}
        }

        //ボタンを追加する列
        if(i%(beatCount*beatDelta)==0){
            cell=rows[i].insertCell(-1);
            cell.innerHTML=
                "<input type='button' onclick='addLine(this)' value='add'><br>"
                +"<input type='button' onclick='clearLine(this)' value='clear'>"
                +"<input type='button' onclick='deleteLine(this)' value='delete'>"
            cell.rowSpan=beatCount*beatDelta;
            cell.classList.add('frame_start');
            cell.classList.add('frame_count');
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
    refreshTable();
}
function cellRClick(e){
    e.preventDefault();
    [i,j]=getIndex(e.target);
    data[i][j]=2;
    refreshTable();
}

function addLine(obj){
    [i,j]=getIndex(obj.parentNode);
    len=beatDelta*beatCount;
    for(c=0;c<len;++c){
        data.splice(i,0,[0,0,0,0,0,0,0,0,0]);
    }
    refreshTable();
}
function clearLine(obj){
    [i,j]=getIndex(obj.parentNode);
    len=beatDelta*beatCount;
    for(c=0;c<len;++c){
        data[i+c]=[0,0,0,0,0,0,0,0,0];
    }
    refreshTable();
}
function deleteLine(obj){
    [i,j]=getIndex(obj.parentNode);
    data.splice(i,beatDelta*beatCount);
    refreshTable();
}

function addFrame(n){
    for(i=0;i<n*beatDelta*beatCount;++i){
        data.push([0,0,0,0,0,0,0,0,0]);
    }
}

function save(){
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
    for(bar=0;bar<data.length/beatCount/beatDelta;++bar){
        for(col=0;col<9;++col){
            ch=[11,12,13,14,15,22,23,24,25][col];
            note=[];
            hstr='#'+('000'+bar).slice(-3)+('00'+ch).slice(-2)+':';
            notestr=''
            for(i=0;i<beatCount*beatDelta;++i){
                notestr+=('00'+data[bar*beatDelta*beatCount+i][col]).slice(-2);
            }
            text+=hstr+notestr+'\n';
        }
    }

    //テキストボックスに出力
    document.getElementById('inputtext').value=text;
}

function load(){
    //dataをクリアする
    data=[];
    addFrame(4);

    bpm=120; //デフォルト値

    text=document.getElementById('inputtext').value; // テキストボックスから入力

    lines=text.split('\n')
    for(i=0;i<lines.length;++i){
        if(lines[i].substr(0,4)=="#BPM" && !isNaN(lines[i].substr(5))){
            bpm=Number(lines[i].substr(5));
        }else if(!isNaN(lines[i].substr(1,5))){
            bar=Number(lines[i].substr(1,3));
            ch=Number(lines[i].substr(4,2));
            d=[0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,0,0,0,0,0,0,5,6,7,8];
            col=d[ch];
            notestr=lines[i].substr(7);
            unit=beatCount*beatDelta*2/notestr.length;
            if(Number.isInteger(unit)){
                //小節数が現在とどちらが多いか数える
                if(bar+1>data.length/beatDelta/beatCount){
                    addFrame(bar+1-data.length/beatDelta/beatCount);
                }
                for(j=0;j<notestr.length/2;++j){
                    data[bar*beatDelta*beatCount+j*unit][col]=Number(notestr.substr(j*2,2));
                }
            }
        }
    }
    document.getElementById('bpm').value=bpm;
    refreshTable();
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
