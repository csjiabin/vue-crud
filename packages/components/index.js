import { toHump } from "vue-crud/utils";
import AddBtn from "./add-btn";
import ContextMenu from "./context-menu";
import Crud from "./crud";
import Dialog from "./dialog";
import Filter from "./filter";
import FilterGroup from "./filter-group";
import Flex1 from "./flex1";
import Pagination from "./pagination";
import RefreshBtn from "./refresh-btn";
import Vnodes from "./vnodes";


const modulesFiles = import.meta.globEager("./**/index.js") // vite
let components = Object.values(modulesFiles).reduce((prev, curr) => {
  let component = curr.default
  if (component && component.name) {
    prev[toHump(component.name.replace(/^v-/, ''))] = component
  }
  return prev
}, {})
export {
  AddBtn,
  ContextMenu,
  Crud,
  Dialog,
  Filter,
  FilterGroup,
  Flex1,
  Pagination,
  RefreshBtn,
  Vnodes
};
export default components