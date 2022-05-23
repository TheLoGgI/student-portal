# A Remix stack with Mongoose integration and Heroku deployment

This is a basic ["custom stack" template][custom-stack] that integrates [Remix][remix] with [Mongoose][mongoose] (and thereby [MongoDB][mongodb]), configures [Tailwind CSS][tailwindcss] and sets up a basic GitHub workflow for deployment to [Heroku][heroku].

## Installation

Run the following in a terminal (you will be prompted to create a directory to contain your project, so run this command in the parent directory):

```sh
npx create-remix@latest --template bewildergeist/remix-mongoose-stack
```

[More information on using custom stacks in Remix][custom-stack].

## Getting started

1. Rename `.env.example` to `.env` and add your MongoDB connection string as the `MONGODB_URL` variable
2. [Initialize a new repository][vs-code-git-init] in this directory and push it to GitHub
3. Set up a new project [on Heroku][heroku-dashboard].
4. Copy your [API key from Heroku][heroku-api-key] and [add it as a secret][gh-secret] to your repository
5. Edit the `.github/workflows/main.yml` file:
   - Enter your Heroku app name in the `heroku_app_name` setting
   - Enter the email address you've used on Heroku to the `heroku_email` setting

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

[tailwindcss]: https://tailwindcss.com
[mongodb]: https://www.mongodb.com/atlas
[heroku]: https://www.heroku.com
[mongoose]: https://mongoosejs.com
[remix]: https://remix.run
[custom-stack]: https://remix.run/docs/en/v1/pages/stacks#custom-stacks
[heroku-dashboard]: https://dashboard.heroku.com/apps
[heroku-api-key]: https://dashboard.heroku.com/account#api-key
[vs-code-git-init]: https://code.visualstudio.com/docs/editor/versioncontrol#_initialize-a-repository
[gh-secret]: https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository
