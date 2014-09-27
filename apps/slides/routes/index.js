module.exports = function(app, passport) {

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.get('/slide', function(req, res) {
  res.render('slideshow', { slideshow:  {
      title: "slideshow",
      description: "slideshow",
      slides: [
          {
            content: "<h1>Slide 1</h1>"
          },
          {
            content: "<h1>Slide 2</h1>"
          },
      ]
  } });
});

}
