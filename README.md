# Real Estate Houses API

Demo app for how to process an unreliable API and download images concurrently. See [Background](#background) and [Requirements](#requirements) below for more info.

## Solution Design Choices

- Strongly Typed: [NestJS](https://nestjs.com) as the backend framework, for it's focus on strong typing, as it's built on Typescript itself and encourages the use of type safety.
  - NestJS allows us to start our solution off simple but to "structure our code as if you were planning to evolve it to production quality".
- [HttpModule](https://docs.nestjs.com/techniques/http-module) for making API requests - a wrapper around [Axios](https://axios-http.com/).
  - HttpModule converts responses into Observables, the main concept of [RxJS](https://rxjs.dev/).
- [Observables](https://rxjs.dev/guide/observable), are a way to represent async data streams, as an alternative to Promises.
  - The `pipe()` function allows you to chain multiple operators together, providing a clean and expressive way to manipulate API responses. 
  - It creates a pipeline for transforming the data through operators like `map()`, `filter()`, etc.
- Error Handling: Observables have built-in error-handling mechanisms. We use operators like `catchError` to gracefully handle errors that may occur during API calls.
- Retry: Leverage built-in `retry()` operator for Observables, which will retry a failed HTTP request, which we can leverage because the API is unstable and sometimes returns non-200 responses.
- Concurrency: `Promise.all()` is used to download all images in parallel (you will notice image downloads complete in non-sequential order in console logs).
  - Shows how promises and observables can be used together.
- We download the first 10 pages are required, but once we get to a successful page of results with zero houses remaining, we stop the download process.
- Unit Tests: See `.spec.ts` files for unit tests.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev
```

Now navigate to http://localhost:3000/ to run the app to process the houses api and download the first 10 pages of images (see console for progress logs).

To follow the code see `src/main.ts` which loads the main controller: `src/houses.controller.ts`.

## Test

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```
------

## Background

We have a simple paginated API that returns a list of houses along with some metadata. Your challenge is to write a script that meets the requirements.

**Note:** this is a unstable API! That means that it will likely fail with a non-200 response code. Your code *must* handle these errors correctly so that all photos are downloaded.

## API Endpoint

You can request the data using the following endpoint:

```
http://app-homevision-staging.herokuapp.com/api_project/houses
```

This route by itself will respond with a default list of houses (or a server error!). You can use the following URL parameters:

- `page`: the page number you want to retrieve (default is 1)
- `per_page`: the number of houses per page (default is 10)

## Requirements

- Requests the first 10 pages of results from the API
- Parses the JSON returned by the API
- Downloads the photo for each house and saves it in a file with the name formatted as:

  `[id]-[address].[ext]`

- Downloading photos is slow so please optimize them and make use of concurrency

### Bonus Points

- Write tests
- Write your code in in a strongly typed language
- Structure your code as if you were planning to evolve it to production quality

### Managing your time

Include “TODO:” comments if there are things that you might want to address but that would take too much time for this exercise. That will help us understand items that you are considering but aren’t putting into this implementation.
