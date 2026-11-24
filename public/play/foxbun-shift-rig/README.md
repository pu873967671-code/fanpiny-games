# 狐兔换挡 / Foxbun Shift

A small canvas platformer for GitHub Game Off 2026, themed **SHIFT**. Explore Gear Desert, Monster Planet, and Crystal Nest. Collect coins, unlock abilities, and defeat the Crystal Nest Mother.

Switch between Gear 1 and Gear 2 to move the gear platforms and open the opposing shutters. In the desert, Gear 1 powers the updraft. Gear 2 stops it and raises the platforms into a staircase. Coins reward exploring both configurations.

## Play

Open `index.html` in a browser, or run `python3 -m http.server` in this directory and visit the local server. No external libraries or network connection are required.

| 操作 / Action | 键位和用法 / Keys and use |
| --- | --- |
| 移动 / Move | ← / → or A / D |
| 跳跃和滑翔 / Jump and glide | Space / ↑ / W / Z。空中按住跳跃键可滑翔，遇上升气流可升高。 Hold jump in the air to glide or rise in an updraft. |
| 扒墙和墙跳 / Wall Cling and Wall Jump | 解锁后朝墙移动可扒墙，再按跳跃键蹬墙。 Once unlocked, hold toward a wall, then press jump to kick off. |
| 尾弹 / Tail Bounce | X / J。解锁后在空中靠近目标时按下，用方向键或 WASD 瞄准。 Once unlocked, press near a target in the air and aim with the arrows or WASD. |
| 冲刺 / Dash | C / L。解锁后在空中配合方向键或 WASD 使用。 Once unlocked, press in the air and aim with the arrows or WASD. |
| 地图 / Map | M 开关地图，Esc 关闭地图。 M toggles the map and Esc closes it. |
| 换挡 / Shift gears | Shift / K |
| 触屏 / Touch | 使用屏幕上的方向、跳跃、换挡和地图按钮。解锁后会显示尾弹和冲刺按钮。 Use the on-screen direction, jump, shift, and map buttons. Tail Bounce and Dash buttons appear when unlocked. |

## Credits and license

Art & design: FanPiny (@FanPiny). Built with AI-assisted tools in November 2026.

Code is licensed under the MIT License. The embedded UI font has its own license; see [assets/OFL-ui-font.txt](assets/OFL-ui-font.txt).
