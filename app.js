//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _  = require("lodash")

const app = express();

mongoose
  .connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => console.log("Connected"))
  .catch((err) => {
    console.log(err);
  });

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  list: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const item1 = new Item({
  name: "You can add new tasks",
});
const item2 = new Item({
  name: "Add the task and click +",
});
const item3 = new Item({
  name: "Checkout the completed tasks",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find()
    .then((items) => {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Added items successfully");
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.listTitle
  const item = new Item({
    name: itemName,
  });
  if(listTitle==="Today"){
    item.save();
  res.redirect("/");
  }else{
    List.findOne({name:listTitle}).then((list)=>{
      list.list.push(item)
      list.save()
      res.redirect("/"+listTitle)
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listname = req.body.listTitle;
  if(listname==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{list:{_id:checkedItemId}}}).then(res.redirect("/"+listname)).catch((err)=>{console.log(err)})
  }
});

app.get("/:listname", (req, res) => {
  const customListName = _.capitalize(req.params.listname);

  List.findOne({ name: customListName })
    .then((list) => {
      if (list) {
       res.render("list",{listTitle:customListName,newListItems:list.list})
      } else {
        const list = new List({
          name: customListName,
          list: defaultItems,
        });
        list.save();
        res.redirect("/"+customListName)
      }
    })
    .catch((err) => {
      console.log(err);
    });
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
