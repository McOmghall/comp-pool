comp-pool
=========

This node.js REST service allows distribution of computing jobs (in javascript) to a hive of web clients and will allow users to send their own jobs to the hive once the multiple security issues are adressed. Methods to try, server-side, the integrity and correcteness of job results are also provided.

It has nothing to do with pool cleaning appliances. Yet.

Api Design
-------------
We use a volunteer pull distributed computation model over a REST API. That means clients can pull (`GET`) `jobs`, job input `variables` and `POST` `results` back to the API. We offer the following resources:

### Jobs ###
A `job` object includes:
* a javascript function named `execute_function`
* an optional `validate_result` function to be executed server-side, by default every result is accepted, otherwise they are validated by this function
* a `variable_scheduler` function that selects `variable objects` (see below) from the `job`'s collection to serve to clients, returning a `variable id`
* associated `metadata` such as a `description` localized text and job `owner`in the form of a `metadata[description][locale]` and `metadata[owner]`. 

Jobs can be served directly using external REST ids or through a scheduler that organizes them for efficient processing in clients.

    POST /job
To send a new job object, expected to be compiled by [Google Caja](https://developers.google.com/caja/) to enhance client's security as suggested [here](http://stackoverflow.com/questions/23758472/closing-access-to-global-variables-javascript). One of the objectives is job posting to be as automated as possible while being secure.

    GET /job/:id
Gets a job by id

    GET /job/scheduler/:scheduler_id`
Uses a scheduler to retrieve a job, internal algorithms are abstracted through this interface

### Job Variables ###
An input `variable` object is an arbitrary javascript object associated to a `job` and is passed to the `execute_function` on each run.

    POST /job/:id/variable
Posts a new variable to be served to clients. Gets validated by the job's `validate_result` function if this function exists, otherwise is accepted by default.

    GET /job/:id/variable
Gets a variable through a variable scheduler, to be chained with the next call

    GET /job/:id/variable/:id
Gets a variable by id

### Job Results ###
A `result` object is an arbitrary javascript object associated to a `variable` the result of the computation over this `variable` object.

    `POST /job/:id/variable/:id/result`
Adds a new result associated to a job and job's variable


#### History ####

It was firstly planned to be a Sinatra-based service, but the node.js ability to allow users to execute code server side made us to finally choose it.
