---
oj: dmy
pid: '506'
title: 卡片翻面
difficulty: 普及−
tags:
  - 线性DP
  - 背包DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 100$，$1 \le S \le 10^4$，$1 \le a_i, b_i \le 10^4$。

## 思路

每张卡片只有选正面或选反面两种决策，且前缀能凑出哪些和只与已处理的前缀有关，是标准的线性 DP（01 背包可行性模型）。

**状态定义：** $can(i, j)$ 表示前 $i$ 张卡片是否存在一种翻面方案使朝上数字之和恰好为 $j$。初值 $can(0, 0) = \text{true}$，其余为假。

**转移方程：** 第 $i$ 张卡片选正面贡献 $a_i$，选反面贡献 $b_i$，因此

$$can(i+1, j+a_i) \mathrel{|}= can(i, j), \qquad can(i+1, j+b_i) \mathrel{|}= can(i, j).$$

由于 $a_i, b_i \ge 1$，部分和只会增长，超过 $S$ 的状态永远不可能回到 $S$，所以第二维只需枚举到 $S$，超出直接丢弃。

**答案判定：** $can(N, S)$ 为假则输出 `No`；为真则需要还原一组方案。

**方案回溯：** 从 $(N, S)$ 倒推。设当前剩下前 $i$ 张卡片、目标和为 $cur$：若 $cur \ge a_i$ 且 $can(i-1, cur-a_i)$ 为真，说明第 $i$ 张可以选正面，令 $cur \gets cur - a_i$、记录 `H`；否则第 $i$ 张必选反面，令 $cur \gets cur - b_i$、记录 `T`。因为 $can(i, cur)$ 为真时两个前驱至少一个为真，回溯必定成功，且每一步都沿着真实存在的前驱走，得到的方案必然合法。

## 复杂度

时间 $O(N \times S)$，空间 $O(N \times S)$。本题中 $N \times S \le 10^6$，非常宽裕。

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
    let s = head[1]
    let a = Array<Int64>(n, { _ => 0 })
    let b = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        a[i] = line[0]
        b[i] = line[1]
    }
    let m = s + 1
    let can = Array<Array<Bool>>(n + 1, { _ => Array<Bool>(m, { _ => false }) })
    can[0][0] = true
    for (i in 0..n) {
        let ai = a[i]
        let bi = b[i]
        for (j in 0..m) {
            if (can[i][j]) {
                if (j + ai < m) {
                    can[i + 1][j + ai] = true
                }
                if (j + bi < m) {
                    can[i + 1][j + bi] = true
                }
            }
        }
    }
    if (!can[n][s]) {
        println("No")
    } else {
        let pickFront = Array<Bool>(n, { _ => true })
        var cur = s
        var i = n - 1
        while (i >= 0) {
            if (cur >= a[i] && can[i][cur - a[i]]) {
                cur -= a[i]
            } else {
                pickFront[i] = false
                cur -= b[i]
            }
            i -= 1
        }
        let sb = StringBuilder()
        for (k in 0..n) {
            if (pickFront[k]) {
                sb.append(r'H')
            } else {
                sb.append(r'T')
            }
        }
        println("Yes")
        println(sb.toString())
    }
}
```

</details>
