import Crud from "./crud";
import ContextMenu from "./context-menu";
import Dialog from "./dialog";
import Flex1 from "./flex1";
import Vnodes from "./vnodes";
const modulesFiles = import.meta.globEager("./**/index.js") // vite
let components = Object.values(modulesFiles).reduce((prev, curr) => {
  let component = curr.default
  prev[component.name] = component
  return prev
}, {})
export { Crud, ContextMenu, Dialog, Flex1, Vnodes };
export default components