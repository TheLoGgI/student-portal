import { json } from "@remix-run/node"

export default function (error: Error | unknown) {
  console.warn("error: ", error)
  // @ts-ignore
  if (error.code === 11000)
    return json({
      msg: "Email already used, try another one",
      status: 400,
      type: "emailExists",
    })

  // @ts-ignore
  switch (error.message) {
    case "emptyFields":
      return json({
        msg: "Need to fill out all form fields",
        status: 400,
        type: "emptyFields",
      })
    case "linkedinInvalid":
      return json({
        msg: "Invalid Linkedin URL",
        status: 400,
        type: "linkedinInvalid",
      })
    case "githubInvalid":
      return json({
        msg: "Invalid Github URL",
        status: 400,
        type: "githubInvalid",
      })
    case "passwordMatch":
      return json({
        msg: "Passwords don't match, try again",
        status: 400,
        type: "passwordMatch",
      })
    case "invalidemail":
      return json({
        msg: "Not a valid email",
        status: 400,
        type: "invalidemail",
      })
    case "networkError":
      return json({
        msg: "Something went wrong, with the server",
        status: 400,
        type: "networkError",
      })
    case "passwordLength":
      return json({
        msg: "Password must be at least 8 characters",
        status: 400,
        type: "passwordLength",
      })
  }
}
