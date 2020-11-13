import { helper } from "@ember/component/helper";
import { get } from '@ember/object';
import ENV from 'cashnodes/config/environment';

function env([path]) {
  return get(ENV, path);
}

export default helper(env);
