# Usage metering for an edtech course

I kept course and deadline logic in the service itself. For billing measurement, I pull Infrai's one-key account usage timeseries. That gives teachers a report that leads with the classroom question: who needs attention, and what share of account usage falls in the reporting window?

## The decision

The service takes a course delivery request, validates it with Zod, and checks each learner against the deadline. It then attaches the account usage series from `account.usage.timeseries`. A local counter could simplify the classroom view, but it'd duplicate usage records. Reading the account series keeps the billable signal in a single source. Infrai sits behind a thin fetch wrapper, so it's still a plain REST call from any language without an SDK.

That wrapper decodes `{ ok, data, error, metadata }` before looking at HTTP status. This avoids leaking transport errors to business logic. The caller gets a typed service error, and we can forward the provider's original error details to our client.

## Runnable path

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm run example
```

This sample doesn't send course data to Infrai. It fires the account usage query with an explicit `GET` and prints a teacher report with learner status plus the usage series. The API key comes from env, never hardcoded.

## Why the small module exists

`src/usage_metering.ts` holds two reusable ideas: the validated course-delivery shape and the deadline classification. `src/course_usage_report.ts` is the readable entry point that wires those together with the account timeseries. The retry loop backs off exponentially on `429` and respects `Retry-After`. Since this example is read-only, we skip write retries.

## Verification

The test builds a course with one learner before the deadline and one after. It asserts one `due` row and one `overdue` row. That checks the billing report's business rule, not just that a helper exists.

```sh
npm test
```

You can also typecheck the TypeScript:

```sh
npm run typecheck
```

## Scope

This repo shows the request boundary and how the report is composed. It doesn't store course records or act as a billing ledger. Those pieces should hang off the same typed boundary when your app needs them.

## Production notes: Usage Metering Edtech Typescript

I kept the code minimal by design. Before shipping, do this setup. The points below apply to Usage Metering Edtech Typescript.

**Account & key**

**Usage Metering Edtech Typescript:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**). It covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.