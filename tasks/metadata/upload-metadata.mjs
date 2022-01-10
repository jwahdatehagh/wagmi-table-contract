import 'dotenv/config'
import pinataSDK from '@pinata/sdk'

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET)

const sourcePath = 'collection/metadata'
const options = {
  pinataMetadata: {
    name: 'wagmi-table',
  },
  pinataOptions: {
    cidVersion: 0
  }
}
pinata.pinFromFS(sourcePath, options).then((result) => {
  // handle results here
  console.log(result)
}).catch((err) => {
  // handle error here
  console.log(err)
})
