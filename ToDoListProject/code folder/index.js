const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

let viewsPath = path.join(__dirname, '../views');
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// serving static files like css
app.use(express.static(path.join(__dirname, '../public')));

let array = [];

let date = new Date();
const day = date.getDate();
console.log(day);

const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/ToDoListProject');
mongoose.connect('mongodb+srv://user_abrar:abrarpassword123@ecommerececluster.x22nxlc.mongodb.net/ToDoListProject');
const schema = mongoose.Schema({
    content: String,
});
const Blog = mongoose.model('ToDoList', schema);

async function loadingData() {
    try {
        const blogs = await Blog.find();
        array = blogs.map(blog => ({
            Input: blog.content
        }));
    } catch (error) {
        console.log("error occurred", error);
    }
}

loadingData();

app.get("/", (req, res) => {
    res.render("home", {
        array: array
    });
});

app.post("/", async (req, res) => {
    let chek = req.body.hidden;
    if (chek === 'add') {
        let Input = req.body.addInput;
        let indexToEdit = req.body.indexToEdit;

        if (indexToEdit.length==0) {
            array.push({ Input: Input });
            const db = await new Blog({
                content: Input
            });
            db.save();
            console.log("written to database");
            console.log("array after pushing", array);
        }
        else {
            let prevValue = array[indexToEdit].Input;
            console.log(prevValue, "     is the previous value");
            let newValue = Input;
            console.log(newValue, "      is the new value to be entered");
            try {
                const filter = { content: prevValue };
                const update = { $set: { content: newValue } };

                const result = await Blog.updateOne(filter, update);

                if (result.modifiedCount === 1) {
                    console.log('Data updated successfully in the database');
                    array[indexToEdit].Input = newValue;
                } else {
                    console.log("No data have been found matching the filter criteria");
                }

            } catch (error) {
                console.log('Error occurred while updating data in the database', error);
            }
        }
        res.redirect("/");

    }

    else if (chek === 'delete') {
        let indexToDelete = req.body.indexToDelete;
        console.log("index of array is", array[indexToDelete]);
        if (indexToDelete !== undefined && indexToDelete >= 0 && indexToDelete < array.length) {
            let toDelete = array[indexToDelete];

            try {
                const result = await Blog.deleteOne({ content: toDelete.Input });
                console.log("deleted from database", result.deletedCount);
            } catch (error) {
                console.error("Error deleting from database", error);
            }
        }
        array.splice(indexToDelete, 1);
        console.log("array after deleting", array);
        res.redirect("/");
    }
});

app.listen(4000, () => {
    console.log("I am running at port 4000");
});
