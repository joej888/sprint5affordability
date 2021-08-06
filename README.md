# General standards

## 1) vod-npm-services
All upstream requests are now to be made via the [vod-npm-services](https://bitbucket.vodacom.co.za/projects/VNM/repos/vod-npm-services/browse) module, please see the [README](https://bitbucket.vodacom.co.za/projects/VNM/repos/vod-npm-services/browse/README.md) in this module for a guide on how it works.

## 2) Update all vod-npm-*
Modules get frequently updated with various bug fixes and new features. Whenever making a new service please ensure you are using the latest versions.

## 3) Logging

Proper logging is an *extremely* important requirement. Without proper logging, you will not be able to debug production issues.

It is of the **utmost importance** to ensure your logs are clean and sanitised properly. Before you push your code, please make sure that all your logs are okay.

Your logs should be short and concise, requiring only the information necessary for debugging issues.

### Important notes

The `req`, `res`, and `Axios error` objects are very large, and will produce very large logs if not handled properly.

Currently, our [logger package](https://bitbucket.vodacom.co.za/projects/VNM/repos/vod-npm-console-logger/browse), `vod-npm-console-logger`, has serialisers setup for:
  * req
  * res
  * err
  * error

This means that any objects that contain those keys on the **root** level, will automatically be serialised for you. Please note that the object to be logged should always be the first parameter to the logger.

```javascript
req.log.debug(object, 'message');
```

## 4) Microservice structure
### a. Middlewares
Most common functionality exists in middlewares. This removes the need for repeated code.

Middlewares now include:
#### Sentry

Basic setting up of the user and tags in Sentry are done for you via middleware. By default, the user is set to the provided msisdn, or auth principal.

If your service is not using a msisdn, you can override how the user is set by passing in a function as the second parameter to the middleware.


```javascript
const findUser = (req) =>
  req.params && req.params.profileId || 'NOT FOUND';

Sentry.setupRequestContext(req, findUser);
```

#### Error handling

Error handling is now done via the error handler, which is registered as a middleware. This error handler can be invoked by calling the `next` function with an error object in your controller.

For more information on what the error handler can do, please refer to its [README](https://bitbucket.vodacom.co.za/projects/VNM/repos/vod-npm-utils/browse/src/error/README.md).

## 5) Unit Tests
Unit tests are made to test a specific, isolated, piece of functionality.
This is done by stubbing all external methods used and ensuring that each method is invoked as expected.

This way when someone else alters the code, any unintended changes won't be made accidentally.

Below are some tips on how to write unit tests:

### a. Stubbing and mocks

Proper stubbing and mocks are the basis of getting your tests done properly and easily.

[Sinon](https://sinonjs.org/releases/latest/stubs/) is the stubbing framework we use, refer to their docs for a list of available functions and how to use them.

It is **mandatory** that all your stubbing and mocking must be done with the `.withArgs()` function, or the `.callsFake()` function for more complicated tests.

These methods are critical, as your stub should only return the correct mock if it was invoked with the correct arguments.

Doing this properly will mean your unit tests will catch bugs in things such as a mapping function that is called before invoking an upstream.

### b. Each branch should have its own unit test

If you write a function that has branching code, you must test all permutations the code could follow.

For example:

```javascript
function foo(x) {
  if (x && x.bar === 'baz') {
    return true;
  }

  return false;
}
```

The above function requires unit tests for:
  * When x is defined and x.bar = "baz"
  * When `x` is null
  * When `x.bar` doesn't exist, or does not equal "baz"

### b. Max out coverage on unit tests
Running `npm run coverage` in any microservice or npm module will give you a detailed breakdown of how well your unit tests cover your code.

You should be aiming for 100% on all files, as this is possible & feasible in almost all cases. Currently the minimum required coverage is 80%.

## 6) Conventions

### a. Linter
Each project has an `.eslintrc` file. In your chosen IDE, install an eslint plugin, and set it to automatically lint for you on save.

Doing this will automatically do 90% of the required code formatting for you.

It is also good practise to run `npm run lint` before you push code, to make sure your code is properly linted. Most projects have a pre-commit hook installed that will run linting and tests for you before you commit. Please ensure that this pre-commit hook is working, and do not disable it!

### b. Controllers - Globals
* Imports must all be grouped together
* "Global" variables must be grouped together under imports, with a single space separating them.
* If you find that your handler has too much logic in it, break the code into handler, and service or helper (I.E. logically split your code).
* If destructuring is being used on imports, a single destructured property must be on 1 line, but more than one must be on multiple lines.
    ```javascript
    const { a } = require('foo');
    const {
      b,
      c
    } = require('bar');
    ```

### c. Controllers - Handler

Please see `src/controllers/README.md` for a general layout of a simple controller, below are some further conventions:

* Sentry generic `setUser` & `setTags` are done in a middleware. If you need to update the user or tags, please note:
  * Calling `Sentry.setUser` will **override** the current user.
  * Calling `Sentry.setTags` will **append** to the current tags.
* Logging should be done between each upstream call.
* Objects that have multiple keys being assigned should be formatted in the following way:
```javascript
const object = {
  key1: 'value1',
  key2: 'value2',
  //...
};
```

### d. Mapping Custom Errors

- To create a custom error message & status, pass a [CustomError](https://bitbucket.vodacom.co.za/projects/VNM/repos/vod-npm-utils/browse/src/error/index.js#145-153) object from your controller to the `next` function, with a custom message.

Example
```javascript
return next(
  new CustomError('SpecialError', statusCode, extraData)
);
```
The extraData field is there to allow for any additional information to be logged.

Alternatively, you can add special error mappings to your config by using the following format:

```yaml
error:
  mappedErrors:
    SpecialError:
      status: # Desired HTTP status code
      message: # Desired error message to be returned to the caller.
```

Doing the above, you can now simply call the `next` function with a simple error object with the correct error name.

```javascript
return next(new Error('SpecialError'));
```
