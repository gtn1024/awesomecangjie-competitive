---
oj: dmy
pid: '38'
title: '[R7B] 炸弹'
difficulty: 普及-
tags:
  - 差分
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 1000$。

## 思路

炸弹 $(i,j)$ 能炸到 $(x,y)$ 当且仅当 $|x-i|+|y-j| \le 3$。固定行 $x$ 后，$|x-i| \le 3$ 的炸弹在该行影响的列是区间 $[j - (3 - |x-i|),\; j + (3 - |x-i|)]$，因此可以用二维差分优化。

对每个炸弹，枚举它影响的行（至多 7 行），在对应行的差分数组上做区间加一。最后对每行求前缀和，即为每个格子被炸到的次数。

复杂度：时间 $O(nm)$，空间 $O(nm)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line0[0]
    let m = line0[1]
    let diff = ArrayList<ArrayList<Int64>>(n, { _ => ArrayList<Int64>(m + 1, { _ => 0 }) })
    for (x in 0..n) {
        let s = reader.readln().getOrThrow().toRuneArray()
        for (y in 0..m) {
            if (s[y] == r'@') {
                for (dx in -3..4) {
                    let nx = x + dx
                    if (nx < 0 || nx >= n) {
                        continue
                    }
                    let d = if (dx < 0) { -dx } else { dx }
                    var l = y - (3 - d)
                    var r = y + (3 - d)
                    if (l < 0) {
                        l = 0
                    }
                    if (r >= m) {
                        r = m - 1
                    }
                    if (l <= r) {
                        diff[nx][l] = diff[nx][l] + 1
                        diff[nx][r + 1] = diff[nx][r + 1] - 1
                    }
                }
            }
        }
    }
    for (x in 0..n) {
        var cur: Int64 = 0
        for (y in 0..m) {
            cur = cur + diff[x][y]
            if (y < m) {
                if (y > 0) {
                    print(" ")
                }
                print(cur)
            }
        }
        println()
    }
}
```

</details>
