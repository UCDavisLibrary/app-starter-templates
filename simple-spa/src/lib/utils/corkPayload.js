import {PayloadUtils} from '@ucd-lib/cork-app-utils'

// TODO: update id parts to match your app
const ID_ORDER = ['foo', 'action'];

let inst = new PayloadUtils({
  idParts: ID_ORDER
});

export default inst;