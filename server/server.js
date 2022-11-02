require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
//middelw takes request and attaches to property body
//takes json to convert to body however we like
// app.use(morgan("dev"));
// app.use((req,res,next) => {
//         console.log("sth");
//         next(); });

//1:47:20 not being parsed, add next
//rest.status(404).json({status:"fail",})
//use third party middleware
//npmjs.com/package/morgan: npm i morgan
// app.use((req,res,next) => {
//     console.log("first middleware");
//     next(); });

// app.use((req,res,next) => {
//     console.log("second middleware");
//     next(); });

//get all rest
app.get("/api/v1/restaurants", async (req, res) => {
    try{
        //const results = await db.query("select * from restaurants");
        const restaurantRatingsData = await db.query(
            "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
        );
        //console.log("results", results);
       // console.log('restaurant data', restaurantRatingsData);
        //console.log(results);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data:{restaurant: results.rows,},
        });
    }
    catch(err){
        console.log(err);
    } 
});
//http://localhost:3000/getRestaurants
//1:26:25 instead of console.log("get all restaurants") res.json to parse to front end 

//get a rest: id = variable. for any value
//2:18:25 route
app.get("/api/v1/restaurants/:id", async (req, res) => {
    console.log(req.params.id);

    try{
        const restaurant = await db.query("select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurant.id = reviews.restaurant_id where id = $1", [req.params.id, ]);
        const reviews = await db.query("select * from reviews where restaurant_id = $1", [req.params.id, ]);
        res.status(200).json({
            status: "success", data: {
            restaurant: restaurantRatingsData.rows.length,
            data: {reviews: restaurantRatingsData.rows,},
            },});
    }
    
    catch(err){
    console.log(err);
    }
});

//create
app.get("/api/v1/restaurants", async (req, res) => {
    console.log(req.body);

    try{
        const results = await db.query("INSERT INTO restaurants (name, location, price_range) values ($1, $2, $3)returning *", [req.body.name, req.body.location, req.body.price_range])
        
        console.log(results)

        res.status(201).json({
            status: "success",
            data: {
                restaurant: results.rows[0],
            },
        });    
    }

    catch(err){
        console.log(err)
    }


//update rest
app.put("/api/v1/restaurants/:id", async (req, res) => {
    try{
        const results = await db.query("UPDATE restaurants SET name = $1, location = $2, price_range = $3 where id = $4 returning *", [req.body.name, req.body.location, req.body.price_range, req.params.id]);

        res.status(200).json({
            status: "success",
            data: {
                restaurant: results.rows[0],
            },
        });
    }

    catch(err){
        console.log(err)
    }
    
    console.log(req.param.id);
    console.log(req.body);

});

//delete
app.delete("/api/v1/restaurants/:id", async (req, res) => {
    try{
        const results = await db.query("DELETE FROM restaurants where id = $1", [req.params.id]);
        res.status(204).json({status: "success",});
    }
    catch(err){
        console.log(err);
    }
});

//app.get("/api/v1/restaurants/:id/reviews", () => {

//})
app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
    try {
        const newReview = await db.query("INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4)", [req.params.id, req.body.name, req.body.review, req.body.rating])
        res.status(201).json({
            status: 'success',
            data: {
                review: newReview.rows[0],
            },});
    }
    catch (err){console.log(err);}
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is up and listening on Port ${port}`);
});
});