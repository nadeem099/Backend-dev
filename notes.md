## jwt

- treat token as your car key - anyone who has it can acess your car
- expire the token
- token -> header, payload, signature
- jwts are credential, which can grant access to resources

**read about jwt and visit jsonwebtoken npm**

[!imp: if form data is not being read in req.body](https://stackoverflow.com/questions/68511200/data-not-passing-to-req-body-variables-from-html-form)

## forms

- get and post types of form
- search/query form -> get
- submitting data -> post
- we have to use different middlewares to parse different types of _content-type_: multer, express.urlencoded(), express.json() etc.

[!imp: read this for file upload](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL)
