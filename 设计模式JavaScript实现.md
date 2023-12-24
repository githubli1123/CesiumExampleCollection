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

建造者模式(builder pattern) 属于创建型模式的一种，提供一种创建复杂对象的方式。它将一个复杂的对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。建造者模式是一-步的创建一个复杂的对象，它允许用户只通过指定复杂的对象的类型和内容就可以构建它们，用户不需要指定内部的具体构造细节。



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


let navabar = new Navbar();
navabar.init();
navabar.getData();
navabar.render();

let list = new List();
list.init();
list.getData();
list.render();
```

建造者模式将一个复杂对象的构建层与其表示层相互分离同样的构建过程可采用不同的表示。 工厂模式主要是为了创建对象实例或者类簇(抽象工厂) ，关心的是最终产出(创建)的是什么，而不关心创建的过程。而建造者模式关心的是创建这个对象的整个过程，甚至于创建对象的每一个细节。

```
```









