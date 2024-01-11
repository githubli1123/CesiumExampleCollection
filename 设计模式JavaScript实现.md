**五大原则**

（1）单一职责原则：一个类，应该仅有一个引起它变化的原因，简而言之，就是功能要单一。
（2）开放封闭原则：对扩展开放，对修改关闭。
（3）里氏替换原则：基类出现的地方，子类一定出现。
（4）接口隔离原则：一个借口应该是一种角色，不该干的事情不干，该干的都要干。简而言之就是降低耦合、减低依赖。
（5）依赖翻转原则：针对接口编程，依赖抽象而不依赖具体。



## 构造器模式

场景

```javascript
let person1 = {
	name: "zhangsan",
	age: 25
};
let person2 = {
	name: "lisi",
	age:28
}
```



```javascript
// 构造器模式 ES5
function PersonES5(name, age) {
    this.name = name;
    this.age = age;
}
let p1 = new PersonES5('Tom', 18);
let p2 = new PersonES5('Jerry', 20);


// 构造器模式 ES6+
class PersonES6 {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
}
const zhangsan = new PersonES6('zhansan2', 19)

```



## 原型模式

原型模式可以理解为：一个对象的产生可以不由零起步，直接从一个已经具备一定雏形的对象克隆，然后再修改为生产需要的对象。

场景：用的最多的地方在于我不希望多写一遍逻辑。本质上是代码复用和对象思想。

在我目前所做的项目中，这个用的是最多了，但是我发现我对于这种方法用的并不好，因为这是需要结合业务认真设计对象（类）中的成员和方法，后面需要进行继承。

```javascript
// 原型模式 ES5
function PersonES5(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.say = function () {
    console.log(`${this.name} is ${this.age} years old.`);
}
let p1 = new PersonES5('Tom', 18);
p1.say();
let p2 = new PersonES5('Jerry', 20);
p2.say();

// 原型模式 ES6+
class PersonES6 {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    say() {
        console.log('hello')
    }
}
const zhangsan = new PersonES6('zhansan2', 19)
zhangsan.say();
```



## 工厂模式

由一个工厂对象决定创建某一种产品对象类的实例。主要用来创建同一类对象。

```javascript
// 工厂模式 ES5 
function User(role, pages){
    this.role = role;
    this.pages = pages;
}
function UserFactory(role){
    switch(role){
        case 'superadmin':
            return new User('superadmin', ['home', 'user-manage', 'tight-manage', 'news=message']);
        break;

        case 'admin':
            return new User('admin', ['home', 'user-manage', 'news-message']);
        break;

        case 'user':
            return new User('user', ['home', 'news-message']);
        break;

        default:
            throw new Error('参数错误, 可选参数:superadmin, admin, user');
        break;

    }
}

// 工厂模式 ES6
class UserES6{
    constructor(role, pages){
        this.role = role;
        this.pages = pages;
    }
    
    static UserFactory(role){
        // map 映射改写也可
        switch(role){
            case 'superadmin':
                return new User('superadmin', ['home', 'user-manage', 'tight-manage', 'news=message']);
            break;

            case 'admin':
                return new User('admin', ['home', 'user-manage', 'news-message']);
            break;

            case 'user':
                return new User('user', ['home', 'news-message']);
            break;

            default:
                throw new Error('参数错误, 可选参数:superadmin, admin, user');
            break;
        }
    }
}
let user = UserES6.UserFactory('admin');

```

简单工厂的优点在于，你只需要一个正确的参数，就可以获取到你所需要的对象，而无需知道其创建的具体细节。但是在函数内包含了所有对象的创建逻辑和判断逻辑的代码，每增加新的构造函数还需要修改判断逻辑代码。当我们的对象不是上面的3个而是10个或更多时，这个函数会成为一个庞大的超级函数，便得难以维护。所以，**简单工厂只能作用于创建的对象数量较少，对象的创建逻辑不复杂时使用。**



## 抽象工厂模式

抽象工厂模式并不直接生成实例，而是用于对产品类簇的创建。

```javascript
// 抽象工厂模式
class User{
    constructor(name, role, pages){
        this.name = name;
        this.role = role;
        this.pages = pages;
    }

    welcome(){
        console.log(`Welcome ${this.name}`);
    }

    dataShow(){
        throw new Error("抽象方法需要被实现");
    }
}

class SuperAdmin extends User{
    constructor(name, role, pages){
        super(name, 'superadmin', ['home', 'user-manage', 'tight-manage', 'news=message']);
    }
    dataShow(){
        console.log('superadmin');
    }

    addUser(){

    }
}

class Admin extends User{
    constructor(name, role, pages){
        super(name, 'admin', ['home', 'user-manage', 'news-message']);
    }
    dataShow(){
        console.log('admin');
    }

    addUser(){

    }
}

class Editor extends User{
    constructor(name, role, pages){
        super(name, 'admin', ['home', 'news-message']);
    }
    dataShow(){
        console.log('editor');
    }
}

function getAbstractUserFactory(role){
    switch(role){
        case 'superadmin':
            return SuperAdmin;
        case 'admin':
            return Admin;
        case 'editor':
            return Editor;
        default:
            throw new Error('参数错误');
    }
}

let u = new (getAbstractUserFactory('superadmin'));

console.log('u', u);
console.log('u.__proto__', u.__proto__);
console.log('u.__proto__.__proto__', u.__proto__.__proto__);

console.log('',SuperAdmin.prototype) // User类
console.log('',User.prototype) // 似乎也是User类

u.dataShow(); // superadmin
u.__proto__.dataShow(); // superadmin
u.__proto__.__proto__.dataShow(); // Error 抽象方法需要被实现
```

使用者关心输出的结果，不关心内部的过程。



## 建造者模式

建造者模式(builder pattern) 属于创建型模式的一种，提供一种创建复杂对象的方式。它将一个复杂的对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。建造者模式是一步一步的创建一个复杂的对象，它允许用户只通过指定复杂的对象的类型和内容就可以构建它们，用户不需要指定内部的具体构造细节。



下面是一个很糟糕的写法：

```javascript
class Navbar{
    init(){
        console.log('navbar init');
    }
    getData(){
        console.log('navbar getData');
    }
    render(){
        console.log('navbar render');
    }
}

class List{
    init(){
        console.log('list init');
    }
    getData(){
        console.log('list getData');
    }
    render(){
        console.log('list render');
    }
}

// 糟糕的写法，糟糕在...
let navabar = new Navbar();
navabar.init();
navabar.getData();
navabar.render();

let list = new List();
list.init();
list.getData();
list.render();
```



下面的这个写法更加糟糕

```javascript
class Navbar{
    init(){
        console.log('navbar init');
        this.getData(); // 糟糕
    }
    getData(){
        console.log('navbar getData');
        this.render(); // 糟糕
    }
    render(){
        console.log('navbar render');
    }
}
```



建造者模式将一个复杂对象的构建层与其表示层相互分离同样的构建过程可采用不同的表示。 工厂模式主要是为了创建对象实例或者类簇(抽象工厂) ，关心的是最终产出(创建)的是什么，而不关心创建的过程。而建造者模式关心的是创建这个对象的整个过程，甚至于创建对象的每一个细节。

```javascript
class Navbar{
    init(){
        console.log('navbar init');
    }
    getData(){
        console.log('navbar getData');
    }
    render(){
        console.log('navbar render');
    }
}

class List{
    init(){
        console.log('list init');
    }
    getData(){
        return new Promise((resolve)=>{
            setTimeout(() => {
                console.log('@@@list getData')
                resolve('@@@list getData');
            }, 3000);
        })
        
    }
    render(){
        console.log('list render');
    }
}

class Creator{
    async startBuild(builder){
        await builder.init();
        await builder.getData();
        await builder.render();
    }
}

let op = new Creator();
let navbar = new Navbar();
let list = new List();
op.startBuild(navbar);
op.startBuild(list);
```



## 单例模式
1、保证一个类仅有一个实例，并提供一个访问它的全局访问点
2、主要解决一个全局使用的类频繁地创建和销毁，占用内存

尽量不要使用全局变量来充当单例模式，容易被污染。

```javascript
// 单例模式 ES5
let SingletonES5 = (function(){
    let instance;

    function User(name, age){
        this.name = name;
        this.age = age;
    }

    return function(name, age){
        if(!instance){
            instance = new User(name, age);
        }
        return instance;
    }
})();

let x = SingletonES5('x');
let y = SingletonES5('y');
console.log(x === y); // true

// 单例模式 ES6
class SingletonES6 {
    constructor(name, age){
        if(!SingletonES6.instance){
            this.name = name;
            this.age = age;
            SingletonES6.instance = this;
        }
        return SingletonES6.instance;
    }
}
let z = new SingletonES6('z');
let w = new SingletonES6('w');
console.log(z === w); // true
```

vuex 和 pinia 中的全局 store 实例借助单例模式实现的，在任何地方访问都是那个唯一实例。

例如：弹窗不要老是创建销毁，应该使用一个弹窗，然后改变它内容和显隐。



## 装饰器模式

装饰器模式能够很好的对已有功能进行拓展，这样不会更改原有的代码，对其他的业务产生影响，这方便我们在较少的改动下对软件功能进行拓展。

将 不核心 “不关联”的功能抽离出来，在需要时再动态注入。十分类似AOP

> 出现原因： 传统的面向对象，**给对象添加功能，往往使用继承方式**，这样会有很多问题，一方面会导致超类和子类之间存在**强耦合性**，当超类改变时，子类也会随之改变；另一方面，继承这种功能复用方式通常被称为“白箱复用”, “白箱”是相对可见性而言的，在继承方式中，超类的内部细节是对子类可见的，继承常常被认为破坏了封装性。完成一些功能复用的同时，有可能创建出大量的子类，使子类的数量呈爆炸性增长
>
> 定义：在不改变原对象的基础上，为对象动态地增加职责的方式称为装饰者模式
>
>
> 个人理解：被装饰的对象并不需要了解它曾经被装饰过，这种透明性使得我们可以递归地嵌套任意多个装饰者对象，让我们可以**不改变函数源代码的情况下，能给函数增加功能**，这正是**开放-封闭原则**给我们指出的光明道路。装饰者模式能够很好的增加类特性。

<img src="https://picx.zhimg.com/70/v2-de0382fa14df88d2c8fd735f307a48ac_1440w.image?source=172ae18b&biz_tag=Post" alt="JS设计模式小纸条-装饰器模式" style="zoom:67%;" />





## 适配器模式

将一个类的接口转换成客户希望的另一个接口。适配器模式让那些接口不兼容的类可以一起工作。

适配器不会去改变实现层，那不属于它的职责范围，它干涉了抽象的过程。外部接口的适配能够让同一个方法适用于多种系统。



## 策略模式

策略模式定义了一系列算法，并将每个算法封装起来，使它们可以相互替换，且算法的变化不会影响使用算法的客户。策略模式属于对象行为模式，它通过对算法进行封装，把使用算法的责任和算法的实现分割开来，并委派给不同的对象对这些算法进行管理。该模式主要解决在有多种算法相似的情况下，使用 `if..else` 所带来的复杂和难以维护。它的优点是算法可以自由切换，同时可以避免多重 `if...else` 判断，且具有良好的扩展性。







## 发布订阅模式

1.观察者和目标要相互知道
2.发布者和订阅者不用互相知道，通过第三方实现调度，属于经过解耦合的观察者模式



























