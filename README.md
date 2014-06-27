# DotDeploy

This website is the server backend for the [DotDeploy frontend](https://github.com/dotdeploy/dotdeploy.github.io).
You can learn more about DotDeploy by visiting the [homepage](http://dotdeploy.works) or learn more about this API by exploring it with [Swagger](http://api.dotdeploy.works)

## Usage

1. Visit the [Google Developers Console](https://console.developers.google.com/project) and either create a project or enter an existing on.
2. In your new project, click on "APIs" in the left side bar and ensure that `Google+ API` and `Google+ Domains API` are enabled
3. Click "Credentials" on the left side bar and create a new Client ID. Ensure that you enter your URIs in the "Redirect URIs" and "Javascript Origins" section. Write down the "Client ID" value for later.
4. Create a new "Public API access" key, giving it access from your IP address. Write down your API key for later.
5. Create a new file in the root of this project called `client-keys.json` and insert the template found below with the values from the previous two steps filled in.
6. Launch the application with `lein ring server-headless` followed by an optional port number to start on.

```
{
    "client-id": "your-id-here.apps.googleusercontent.com",
    "api-key": "your-key-here"
}
```

## License

Copyright © 2014 Tony Grosinger, Spencer Thomas, Ansel Santosa

Distributed under the Apache 2 License.
