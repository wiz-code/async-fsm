# Async-FSM

**Async-FSM**はステートマシン（Finite StateMachine）実装のためのJavaScriptライブラリです。ソースコードはNode.jsで書かれています。

## Async-FSMの特徴（Features）

 * UML2.0をベースに設計。状態の生成から遷移、トリガの指定など主要な機能をサポート。
 * サーバー・クライアントサイド両方での利用を想定。ソースコードはMITライセンスで改変・再配布が自由。
 * コンポジット状態やサブマシン状態など複雑な階層を持った状態に対応。履歴疑似状態など多くの疑似状態をサポート。
 * マシン・状態・遷移などをオブジェクトとして扱い、オブジェクト間の相互作用モデルによる柔軟なプログラミングが可能。
 * Promise機構の非同期処理を利用して状態の振る舞いやトリガを適切なタイミングで実行。

## 使い方（Usage）
### ブラウザで使う場合（Browser）
```html
<script src="https://cdn.rawgit.com/wiz-code/async-fsm/2d471fa3/dist/async-fsm.min.js"></script> 
```
### サーバーで使う場合（Server）
[npm](https://www.npmjs.com/)でパッケージをインストールできます。

    $ npm install "@wiz-code/async-fsm"

Node.jsの<i>require()</i>関数を使ってモジュールを読み込みます。
```javascript
var FSM = require('async-fsm');
```

### ライブラリの構成
Async-FSMはいくつかの依存ライブラリがあります。[Underscore.js](https://github.com/jashkenas/underscore)、[Bluebird](https://github.com/petkaantonov/bluebird)、[UUID](https://github.com/kelektiv/node-uuid)の3つで、上記のURLはそれらすべてがインクルードされたファイルです。  

Async-FSMが読み込まれると*FSM*という、このライブラリのクラス（コンストラクタ）を集約したグローバル変数が作成されます。

#### 基本のクラス
 * FSM.Machine
 * FSM.State
 * FSM.Transition
 * FSM.Region

#### 高度なクラス
 * FSM.InitialPseudoState
 * FSM.FinalState
 * FSM.SubMachine
 * FSM.HistoryPseudoState
 * FSM.TerminatePseudoState
 * FSM.ChoicePseudoState
 * FSM.EntryPointPseudoState
 * FSM.ExitPointPseudoState

### ステートマシンの構築と実行
FSM.Machineクラスのインスタンスを作成します。
```javascript
var myMachine = new FSM.Machine('my-machine');
```
FSM.Stateクラスを使ってステートマシン図に追加する状態を作成します。
```javascript
var myState1 = new FSM.State('my-state1');
var myState2 = new FSM.State('my-state2');
```
ステートマシンのインスタンスに状態を追加します。
```javascript
myMachine.addState(myState1, myState2);
```
FSM.Transitionクラスを使って、各状態からの遷移を作成します。
```javascript
var firstTransit = new FSM.Machine('first-transit', false, state1);
var secondTransit = new FSM.Machine('second-transit', state1, state2);
```
ステートマシンのインスタンスに状態を追加します。
```javascript
myMachine.addTransition(firstTransit, secondTransit);
```
ステートマシンに状態と遷移を追加し終わったら、ステートマシンの<i>deploy()</i>メソッドでシステムの構築を完了します。
```javascript
myMachine.deploy();
```
ステートマシンの<i>start()</i>メソッドでシステムを起動します。
```javascript
myMachine.start();
```

### 各クラス詳細
#### Machineクラス
**Machine**クラスはステートマシン図のトップレベルを示すステートマシン（以下マシン）を生成します。マシンは「状態（State）」の一種であり、「領域（Region）」を持つなど**State**と同じように振る舞いますが、Stateクラスと異なりEntryアクションなどがありません。

Machineインスタンスが生成されると、内部的な処理として自動的にひとつの領域が追加され、さらにそこへ開始疑似状態と終了状態が追加されます。ステートマシン図が階層を持たない（単純状態のみの構成）ならば、図を構成するすべてのState/TransitionインスタンスはMachineインスタンスのメソッド群（<i>addState()</i>など）を使用して追加します。もし状態や遷移の追加作業がすべて終了したら、自身の<i>deploy()</i>メソッドを実行してマシンを起動可能な状態にします。マシンを起動するには自身の<i>start()</i>メソッドを使います。

    new Machine( String $state_name [, Object $options] )

##### Machineクラスのオプション
プロパティ名: データ型 ［デフォルト値］
 * data: Object [empty object]
 * props: Object [empty object]
 * methods: Object [empty object]

##### Machineクラスのプロパティ/メソッド

###### クラス共通のメソッド
 * getId()
 * getName()
 * setName()
 * isActive()

###### Machineクラス固有のメソッド
 * deploy()
 * undeploy()
 * start()
 * finish()

###### Machine/Stateクラス共通のプロパティ
 * region: Region [Regionインスタンス]

###### Machine/Stateクラス共通のメソッド
 * addState( State $instance1 [, State $...] )
 * addTransition( Transition $instance1 [, Transition $...] )
 * appendRegion( Region $instance )
 * removeState( State $instance1 [, State $...] )
 * removeTransition( Transition $instance1 [, Transition $...] )
 * removeRegion( Region $instance )
 * completion()

#### Stateクラス
**Stateクラス**はステートマシンの各状態（単純状態・コンポジット状態・直交状態）を生成します。Stateクラスは親要素（コンテナ）にひとつの領域（Regionインスタンス）を指定でき、子要素に複数の領域を持つことができます。ただし、Machineクラスと異なり始めから領域が追加されることはありません。領域を追加するには自身の<i>appendRegion()</i>メソッドを使います。なお、領域を持たない状態で<i>addState()</i>メソッドを使用した場合、自動的に領域が作成されます。デフォルトの領域はMachine/Stateクラスの<i>region</i>プロパティで参照することができます。領域を複数追加した場合、それらが遷移時に処理される順番は追加された順になります。

Stateインスタンスは遷移のタイミングで指定された<i>entryAction()</i>、<i>doActivity()</i>、<i>exitAction()</i>を実行します。これらはStateインスタンスを生成するときオプションで指定します。これらのコールバック関数は実行時にトップレベルのステートマシンのデータ構造が渡されます（後述）。これらの振る舞いは基本的に一度だけ実行されますが、<i>loop</i>オプションをtrueに指定すると、Doアクティビティが反復して実行されます。ループ中はDoアクティビティの引数に前後のコールバック実行時間の差分が渡されます。<i>fps</i>オプションはループをONにしているときのみ有効で、Doアクティビティの実行間隔を指定できます。<i>autoTransition</i>オプションはtrueを指定すると、Doアクティビティの実行後、自動的に完了遷移に移行します。

Async FSMの仕様上Stateクラスは子要素にStateインスタンスを持つことができませんが、便宜上自身の子要素の最初に追加されたRegionインスタンスに直接アクセスできる<i>addState()</i>・<i>addTransition()</i>メソッドが用意されています。

```javascript
//本来の状態の追加方法
state.region.addState(subState);
//上のコードのシュガーシンタックス
state.addState(subState);
```

##### インスタンス作成書式
    new State( String $state_name [, Object $options] )
（注）$state_nameを省略したいときは、第1引数にfalseを指定します。  
（作成例1）
```javascript
var newState = new FSM.State('new-state');
newMachine.addState(newState);
```
（作成例2）
```javascript
var newState = new FSM.State('new-state', {
    entryAction: function (model, props, methods) {
        console.log('entry!!');
    },
    exitAction: function (model, props, methods) {
        console.log('exit!!');
    },
    autoTransition: true,
});

newMachine.addState(newState);
```

##### Stateクラスのオプション
プロパティ名: データ型 ［デフォルト値］
 * data: Object [empty object]
 * props: Object [empty object]
 * methods: Object [empty object]


 * entryAction: Function [empty function]
 * doActivity: Function [empty function]
 * exitAction: Function [empty function]
 * autoTransition: Bool [false]
 * loop: Bool [false]
 * fps: Int [60]

##### Stateクラスのプロパティ/メソッド
###### クラス共通のメソッド
 * getId()
 * getName()
 * setName()
 * isActive()

###### State/Transitionクラス共通のメソッド
 * getContainer()
 * getCurrentLevel()

###### Machine/Stateクラス共通のプロパティ
 * region: Region [null]

###### Machine/Stateクラス共通のメソッド
 * getRegion(int regionIndex)
 * addState( State $instance1 [, State $...] )
 * addTransition( Transition $instance1 [, Transition $...] )
 * appendRegion( Region $instance )
 * removeState( State $instance1 [, State $...] )
 * removeTransition( Transition $instance1 [, Transition $...] )
 * removeRegion( Region $instance )
 * completion()

#### Transitionクラス
**Transition**クラスはStateインスタンス間のイベントを定義します。インスタンス作成時に遷移前と遷移後のStateインスタンスを指定します。オプションでガード条件やエフェクト（遷移注に実行される振る舞い）を指定することもできます。ただし、<i>guard</i>オプションは必ず真偽値を返す関数を指定しなければなりません。このTransitionインスタンスは<i>trigger()</i>メソッドを持ちます。<i>trigger()</i>メソッドが実行されると、メソッドが記述されたスコープに関係なく即座に状態の遷移が開始されます。また、<i>internal</i>オプションをtrueに指定すると内部遷移となり、ExitアクションとEntryアクションが省略された状態で自己遷移を行います。なお、完了遷移や終了状態に入場後の遷移のように、遷移が<i>trigger()</i>メソッドによらない自動遷移の場合、<i>locked</i>オプションがfalseにします。すると遷移が開始されてからAsync FSMが自動的にマッチしたTransitionインスタンスを探しに行ってそれを実行します。

    new Transition( String $transit_name , State $source , State $target [, Object $options] )
（注）$transit_nameを省略したいときは、第1引数にfalseを指定します。  
（作成例1）
```javascript
var newTransit = new FSM.Transition('new-transit', state1, state2);
```
（作成例2）
```javascript
var newTransit = new FSM.Transition('new-transit', state1, state2, {
    guard: function (model, props, methods) {
        console.log('guard!!');
        return true;
    },
    effect: function (model, props, methods) {
        console.log('effect!!');
    },
    internal: true,
});

newMachine.addTransition(newTransit);
```
開始疑似状態からの遷移と、終了状態への遷移に関してはそれらのインスタンスを引数に指定する代わりにfalseまたはコンストラクタを指定します。
```javascript
//開始疑似状態からの遷移
var newTransit = new FSM.Transition('new-transit', false, state1);

//代わりに開始疑似状態のコンストラクタを指定する方法もある
var newTransit = new FSM.Transition('new-transit', FSM.InitialPseudoState, state1);
```
```javascript
//終了状態への遷移
var newTransit = new FSM.Transition('new-transit', state1, false);

//代わりに終了状態のコンストラクタを指定する方法もある
var newTransit = new FSM.Transition('new-transit', state1, FSM.FinalState);
```
##### Transitionクラスのオプション
プロパティ名: データ型 ［デフォルト値］
 * data: Object [empty object]
 * props: Object [empty object]
 * methods: Object [empty object]


 * guard: Function [null]
 * effect: Function [null]
 * internal: Bool [false]
 * locked: Bool [true]

##### Transitionクラスのプロパティ/メソッド
###### クラス共通のメソッド
 * getId()
 * getName()
 * setName()
 * isActive()
###### State/Transitionクラス共通のメソッド
 * getContainer()
 * getCurrentLevel()
###### Transitionクラス固有のプロパティ・メソッド
 * trigger()

#### Regionクラス
**Region**クラスはステートマシン図の「領域（Region）」と同等の意味を持ちます。Regionクラスは親要素にひとつのState/Machineインスタンスを指定でき、子要素に複数のStateとTransitionを持ちます。Regionクラスは直交状態を使用しない限り、ユーザーが明示的に使用することはないですが、Machineインスタンスとコンポジット状態（サブ状態を持つ状態）は内部的にRegionインスタンスが追加されます。ですから、Machine/Stateクラスが持つ<i>addState()</i>・<i>addTransition()</i>メソッドは本来Regionクラスの固有メソッドで、内部でRegionインスタンスにアクセスしています。

##### インスタンス作成書式
    new Region( String $region_name [, Object $options] )
（注）$region_nameを省略したいときは、第1引数にfalseを指定します。  
（作成例）
```javascript
var newRegion = new FSM.Region(false);
newMachine.appendRegion(newRegion);
```

##### Regionクラスのオプション
プロパティ名: データ型 ［デフォルト値］
 * data: Object [empty object]
 * props: Object [empty object]
 * methods: Object [empty object]

##### Regionクラスのプロパティ/メソッド

###### クラス共通のメソッド
 * getId()
 * getName()
 * setName()
 * isActive()

###### Regionクラス固有のメソッド
 * hasHistory(Bool $id_deep [false])
 * getIndex()

#### HistoryPseudoStateクラス
浅い履歴疑似状態を作成・追加
```javascript
var history = new FSM.HistoryPseudoState(false);
someState.addState(history);
```
深い履歴疑似状態を作成・追加
```javascript
var deepHistory = new FSM.HistoryPseudoState(false, true);
someState.addState(deepHistory);
```

#### TerminatePseudoStateクラス
停止疑似状態を作成・追加
```javascript
var terminator = new FSM.TerminatePseudoState(false);
someState.addState(terminator);

var anyToTerminator = new FSM.Transition(false, anyState, terminator);
someState.addTransition(anyToTerminator);
```

#### ChoicePseudoStateクラス
選択疑似状態を作成・追加
```javascript
var choice = new FSM.ChoicePseudoState(false, function (model, props, methods) {
    return anyState;
});
someState.addState(choice);

var choiceToAny = new FSM.Transition(false, choice, anyState);
someState.addTransition(choiceToAny);
```

#### SubMachineクラス
マシンをSubMachineクラスでラップすることで、別のステートマシン図のサブマシン状態として再利用できます。そのためにマシン側と、SubMachineインスタンス側でリンクする入場・退場ポイントを指定する必要があります。
```javascript
//サブマシン状態にするマシンをラップするオブジェクトを作成
var subMachine = new FSM.SubMachine(false);
someState.addState(subMachine);

ラッパーオブジェクトに入場ポイントと退場ポイントを追加
var subMachineEntryPoint = new FSM.EntryPointPseudoState('submachine-entry-point');
var subMachineExitPoint = new FSM.ExitPointPseudoState('submachine-exit-point');
subMachine.addState(subMachineEntryPoint, subMachineExitPoint);

//サブマシン状態として使用するマシン
var linkedMachine = new FSM.Machine('linked-machine');
var linkedMachineSomeState = new FSM.State('linked-machine-some-state');
//ラッパーオブジェクトとリンクさせるポイントを追加
var linkedMachineEntryPoint = new FSM.EntryPointPseudoState('linked-machine-entry-point');
var linkedMachineExitPoint = new FSM.ExitPointPseudoState('linked-machine-exit-point');
linkedMachine.addState(linkedMachineSomeState, linkedMachineEntryPoint, linkedMachineExitPoint);

var linkedMachineFirstTransit = new FSM.Transition(false, linkedMachineEntryPoint, linkedMachineSomeState);
var linkedMachineFinalTransit = new FSM.Transition(false, linkedMachineSomeState, linkedMachineExitPoint);
linkedMachine.addTransition(linkedMachineFirstTransit, linkedMachineFinalTransit);

//ラッパーオブジェクトとサブマシン状態をリンクさせる
subMachineEntryPoint.setKey(linkedMachineEntryPoint.getId());
subMachineExitPoint.setKey(linkedMachineExitPoint.getId());

linkedMachine.deploy();

subMachine.addLink(linkedMachine);
subMachine.deploy();
```

#### データ取得・設定
Machine/State/Transition/Regionクラスはインスタンスごとにデータストアを持っています。データは**Model**/**Props**/**Methods**に区分され、Modelは主にデータの値が変更されるタイプを格納し、<i>get()</i>・<i>set()</i>メソッドでデータを取得・設定します。また、インスタンス作成時のオプションのdataプロパティにkey/value形式でまとめてデータを指定することができます。Propsは値の変更がないデータ、たとえばユーザーIDなどを格納し、こちらはpropsオプションにまとめて指定します。Methodsはコールバック関数内で何度も使用されるようなメソッドを登録します。methodsオプションに指定します。なお、これらのデータ区分に特に制約はないので、たとえばPropsにメソッドを指定しても問題はありません。
```javascript
var state1 = new FSM.State('state1', {
    data: {
        score: 10000,
    },
    entryAction: function (model, props, methods) {
        console.log( this.get('score') ); //10000
    },
});

state1.set('score', 0);
state1.get('score'); //0
```
State/Transitionクラスは上記のインスタンス固有のデータの他、ひとつ上の階層のStateインスタンスのデータストアにアクセスすることができます。こちらは<i>$get()</i>・<i>$set()</i>メソッドでデータ取得・設定します。これによって特定の状態に属する全領域の子要素（State/Transition）をひとつのグループとして共通のデータのやり取りができます。

```javascript
state.set('group-id', '12345');

subState = new FSM.State('sub-state', {
    entryAction: function (model, props, methods) {
        console.log( this.$get('group-id') ); //'12345'
    },
});
```
システムの最上位であるMachineインスタンスのデータストアはすべてのState/Transitionクラスの子孫要素でアクセス可能です。コールバック関数の引数にModel・Props・Methodsの順でデータが渡されます。
```javascript
machine.props['request-url'] = 'http://abc.abc.abc/';

state = new FSM.State('state', {
    entryAction: function (model, props, methods) {
        console.log( props['request-url'] ); //'http://abc.abc.abc/'
    },
});
```
注意点として、StateクラスのオプションでループをONにした場合、Doアクティビティのコールバック関数に渡される引数の順番が変更されます。まず第1引数に前後のコールバック関数の実行時間の差分（Delta Time）がミリ秒単位で渡され、それに続いてModel・Props・Methodsが渡されます。Delta Timeはアニメーションなどへの利用を想定しています。
```javascript
state = new FSM.State('state', {
    doActivity: function (deltaTime, model, props, methods) {
        console.log( deltaTime ); //16.7, 16.7, 16.7....
    },
});
```
