import neo4j, { QueryResult } from "neo4j-driver";

const driver = neo4j.driver("bolt://127.0.0.1:7687", neo4j.auth.basic("neo4j", "lizardfrog"), {
  disableLosslessIntegers: true,
});

export const executor = async (queryString: string, params: Record<string, any>) => {
  console.log(queryString);
  console.log(params);
  console.log("-----------------");

  const session = driver.session();

  return new Promise<QueryResult>((resolve, reject) => {
    session
      .run(queryString, params)
      .then(result => {
        console.log({
          performance: [
            result.summary.resultConsumedAfter,
            result.summary.resultAvailableAfter,
          ],
          changes: result.summary.counters.updates(),
        });
        console.log("-----------------");
        resolve(result);
        session.close();
        driver.close();
      })
      .catch(error => {
        reject(error);
      });
  });
};
