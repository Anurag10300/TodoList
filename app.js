//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const e = require("express");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB", {useNewUrlParser: true});


const itemsSchema = {
    name:String
};

const Item = mongoose.model("Item", itemsSchema); 




const item1 = new Item({
  name:"Task1"
});

const item2 = new Item({
  name:"Task2"
});

const item3 = new Item({
  name:"Task3"
});

const defItems = [item1,item2,item3];


app.get("/", function(req, res) {

  Item.find(function(err,items){
    if(err){
      console.log(err);
    }else{
       res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

 

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName =  req.body.list;
  

  var itemToBeAdded = new Item({
    name:item
  });

  if(listName === "Today"){
    itemToBeAdded.save();
    res.redirect('/');
  }else{
      List.findOne({name:listName} , function(err, foundList){
      
      foundList.items.push(itemToBeAdded); 
      foundList.save();
  

      res.redirect("/"+listName);
    });
  }

});

app.post("/delete" , function(req,res){

  var listName = req.body.name;
  var itemToDeleteId = req.body.checkbox;
  
  if(listName === "Today"){

    Item.deleteOne({_id:itemToDeleteId} , function(err){
      if(err){
      console.log(err);
      }else{
      console.log("Item deleted succesfully!");
      }
    });
    res.redirect('/');

  }else{
    List.findOneAndUpdate({name: listName} , {$pull : {items: {_id: itemToDeleteId}}} , function(err , list){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

const listSchema = {
  name: String,
  items:[itemsSchema]
};



const List = mongoose.model("Lists" , listSchema);




app.get("/:customName", function(req,res){

  const customListName = _.capitalize(req.params.customName);

  List.findOne({name:customListName} , function(err , list){

    if(!err){
      if( !list ){
        //create new list

        const customList = new List({
        name:customListName,
        items: []
        });

        customList.save();
        res.redirect("/"+customListName);
      

      }else{
        
        res.render('list.ejs' , {listTitle: list.name , newListItems:list.items});
      }
    }
    
  })

});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
