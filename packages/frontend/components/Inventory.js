import { useState, useEffect } from 'react'
import styles from "@styles/components/Inventory.module.scss"; // Component styles

// Modified From https://github.com/charcombination/pixeldex/
const Inventory = ({ inventory: initialInventory, filter, selected, onSelectAsset }) => {
  const [inventory, setInventory] = useState(null);

  const getInventory = (filterString) => {
    const inventory = initialInventory
      .filter(asset => asset.description.name.toLowerCase().includes(filterString.toLowerCase()))
      .slice(0, 8)

    // if(selected && !inventory.includes(selected)) {
    //   onSelectAsset(null);
    // }

    return inventory;
  }

  useEffect(() => {
    setInventory(getInventory(filter));
  }, [filter, initialInventory])

  const InventoryElement = ({ asset }) => {
    const imageURL = `https://community.akamai.steamstatic.com/economy/image/${asset.description.icon_url}/330x`

    return (
      <button className={styles.inventory_element} onClick={() => onSelectAsset(asset)}>
        {selected && selected.id === asset.id && <div className={styles.selection_marker}/>}
        <img src={imageURL} alt="inventory"/>
      </button>
    )
  }

  return (
    <div className={styles.inventory_elements}>
      {inventory && inventory.map(asset => (
        <InventoryElement asset={asset} key={asset.id} />
      ))}
    </div>
  )
}

export default Inventory