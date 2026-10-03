---
oj: dmy
pid: '156'
title: '[R26C]石头剪刀布'
difficulty: 提高
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 1000$，$1 \le y, z \le 10^9$，所有手势均为 `0`、`1`、`2` 之一。

## 思路

`apiadu` 必须从 $n$ 位对手中选一位，与他在 $m$ 轮中逐一过招。每位对手的得分是独立的，因此只需对每位对手算出 $m$ 轮的总得分，再取所有对手的最大值即为答案。

胜负判定可以统一成一个式子。设 `apiadu` 出 $a$，对手出 $b$，记 $d = (b - a + 3) \bmod 3$：

- $d = 1$：`apiadu` 赢，得 $y$ 分；
- $d = 2$：`apiadu` 输，失 $z$ 分；
- $d = 0$：平局，分数不变。

简单验证：石头(`0`)胜剪刀(`1`)对应 $(a, b) = (0, 1)$，$d = 1$ ✓；布(`2`)胜石头(`0`)对应 $(a, b) = (2, 0)$，$d = (0 - 2 + 3) \bmod 3 = 1$ ✓；其余同理。

最大可能的总得分绝对值不超过 $m \cdot \max(y, z) \le 10^3 \times 10^9 = 10^{12}$，用 `Int64` 即可。

## 复杂度

时间 $O(n \cdot m)$，最多约 $10^6$ 次比较；空间 $O(m)$，只需保存 `apiadu` 的手势序列。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let m = head[1]
    let y = head[2]
    let z = head[3]
    let apiadu = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var best = Int64.Min
    var i = 0
    while (i < n) {
        let opp = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var score = 0
        var j = 0
        while (j < m) {
            let a = apiadu[j]
            let b = opp[j]
            let diff = (b - a + 3) % 3
            if (diff == 1) {
                score += y
            } else if (diff == 2) {
                score -= z
            }
            j++
        }
        if (score > best) {
            best = score
        }
        i++
    }
    println(best)
}
```

</details>
