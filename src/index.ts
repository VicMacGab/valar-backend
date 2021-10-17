import api from "./app";

const port: number = 5000;

api.listen(port, () => {
  console.log("Server Ready 😎");
  console.log(`Listening on: localhost:${port}`);
});

// mongoose.connect(
//   dbUrl,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: true,
//   },
//   (error) => {
//     if (error) {
//       console.log("could not connect to mongo db: %o", error);
//     } else {
//       console.log("db connection successful");
//       console.log("starting server");

//       api.listen(port, () => {
//         console.log("Server Ready 😎");
//         console.log(`Listening on: localhost:${port}`);
//       });

//     }
//   }
// );
