/*!
   Copyright 2019 Ron Buckton

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import "source-map-support/register";
import {ParameterType, PluginHost} from "typedoc/dist/lib/utils";
import {LinkRewriterPlugin} from "./plugin";

function load(host: PluginHost) {
    const app = host.owner;
    if (app.renderer.hasComponent("linkrewriter")) {
        return;
    }

    app.renderer.addComponent("linkrewriter", new LinkRewriterPlugin(app.renderer));

    app.options.addDeclaration({
        help: "The path to a JSON file or JS file exporting a Links object.",
        name: "rewriteLinks",
        type: ParameterType.String
    })
}

export = load;
