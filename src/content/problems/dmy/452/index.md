---
oj: dmy
pid: '452'
title: '[R73B] 爱吃白饭的大肥鱼2'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$n \le 2 \times 10^5$，$m \le 10^9$。

## 思路

直接按题意模拟。始终维护大肥鱼覆盖的区间 $[l, r]$ 和成功捕食次数 $cnt$，初始 $l = r = s$、$cnt = 0$。顺序处理每条小鱼出现的位置 $x$：

- 若 $l \le x \le r$：被吃掉，$cnt$ 加一，区间向左右各扩张一个位置，即 $l = \max(1, l - 1)$、$r = \min(m, r + 1)$；
- 若 $x < l$：整体左移，$l \mathrel{-}= 1$、$r \mathrel{-}= 1$。由于 $x \ge 1$ 且 $x < l$，必有 $l \ge 2$，左移不会越过边界；
- 若 $x > r$：整体右移，$l \mathrel{+}= 1$、$r \mathrel{+}= 1$。同理 $x \le m$ 且 $x > r$ 保证 $r \le m - 1$，右移也不会越界。

因此只有吃到鱼的扩张需要钳制到 $[1, m]$，平移天然合法。$n$ 只小鱼依次处理完毕，输出 $cnt$ 和最终的 $l, r$ 即可。

## 复杂度

时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = nm[1]
    var l = nm[2]
    var r = nm[2]
    var cnt: Int64 = 0
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    for (x in a) {
        if (x >= l && x <= r) {
            cnt += 1
            if (l > 1) {
                l -= 1
            }
            if (r < m) {
                r += 1
            }
        } else if (x < l) {
            l -= 1
            r -= 1
        } else {
            l += 1
            r += 1
        }
    }
    println("${cnt} ${l} ${r}")
}
```

</details>