---
oj: dmy
pid: '380'
title: '[R61B] 墙'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 100$。

## 思路

枚举每个墙格子，检查上下左右四个方向，统计在网格范围内且也是墙的相邻格子数量，恰好为 1 则答案加一。边界上的格子通过坐标范围判断跳过不存在的方向。

复杂度：时间 $O(nm)$，空间 $O(nm)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    var g = Array<String>(n, { _ => "" })
    for (i in 0..n) {
        g[i] = reader.readln().getOrThrow()
    }
    var ans: Int64 = 0
    for (i in 0..n) {
        for (j in 0..m) {
            if (g[i][j] != UInt8(0x23)) {
                continue
            }
            var cnt: Int64 = 0
            if (i > 0 && g[i - 1][j] == UInt8(0x23)) {
                cnt = cnt + 1
            }
            if (i + 1 < n && g[i + 1][j] == UInt8(0x23)) {
                cnt = cnt + 1
            }
            if (j > 0 && g[i][j - 1] == UInt8(0x23)) {
                cnt = cnt + 1
            }
            if (j + 1 < m && g[i][j + 1] == UInt8(0x23)) {
                cnt = cnt + 1
            }
            if (cnt == 1) {
                ans = ans + 1
            }
        }
    }
    println(ans)
}
```

</details>

要点：

- `#` 的 ASCII 码是 `0x23`；`g[i][j]` 取到的是字符串的第 $j$ 个字节，用 `UInt8(0x23)` 比较。
- 四个方向的越界检查分别写在前置条件里：`i > 0`、`i + 1 < n`、`j > 0`、`j + 1 < m`，短路求值保证不越界访问。
