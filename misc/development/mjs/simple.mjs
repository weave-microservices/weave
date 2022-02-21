import { createBroker } from "../../../packages/core/core/lib/index.mjs";

const broker = createBroker();

broker.createService({
  name: 'test'
})

await broker.start()

setInterval(async () => {
  const res = await broker.ping()
  broker.log.info(res)
}, 2000)
console.log('started')