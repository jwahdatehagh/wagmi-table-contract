import fs from 'fs'
import collection from '../../collection/collection.mjs'
import * as IPFS from 'ipfs-core'

const DATA_PATH = `collection/metadata`

// Empty metadata folder
fs.rmdirSync(DATA_PATH, { recursive: true })
fs.mkdirSync(DATA_PATH)

const ipfs = await IPFS.create()

const metadataCollection = collection.map(item => ({
  id: item.id,
  symbol: item.symbol,
  name: item.name,
  description: item.description,
  image: 'image.png',
  background_color: 'FEEDDB',
  external_url: `https://wagmitable.xyz#${item.id}`,
  attributes: [
    {
      trait_type: 'group',
      value: item.group,
    },
  ],
}))

for (const metadata of metadataCollection) {
  // Create the metadata folder
  const folder = `collection/metadata/${metadata.id}`
  fs.mkdirSync(folder)

  // Add the image
  fs.copyFileSync(`collection/images/${metadata.id}.png`, `${folder}/image.png`)

  // Hash the image
  const { cid } = await ipfs.add({
    // path: `${folder}/image.png`,
    content: fs.readFileSync(`${folder}/image.png`),
  }, {
    onlyHash: true
  })
  metadata.image = `ipfs://${cid}`

  // Write the metadata
  fs.writeFileSync(`${folder}/metadata.json`, JSON.stringify(metadata, null, 4))
}

ipfs.stop()
