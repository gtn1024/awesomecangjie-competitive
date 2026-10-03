---
oj: dmy
pid: '260'
title: '[R42E]职位调整'
difficulty: 普及+/提高
tags:
  - 动态规划
  - 树
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 4000$，$1 \le a_i, b_i \le 10^8$，$1 \le p_i < i$。

## 思路

先把总工作效率展开。记 $sub(u)$ 为 $u$ 的子树（含自身），$val_u$ 为 $u$ 号职位上员工的最终能力值：

$$\sum_{i=1}^n s_i \times i = \sum_{i=1}^n i \sum_{u \in sub(i)} val_u = \sum_{u=1}^n val_u \sum_{i \in path(1,u)} i$$

即每位员工对总效率的贡献等于**能力值乘以根到其职位的路径上所有编号之和**。记 $W(u) = \sum_{i \in path(1,u)} i$，由 $p_i < i$ 可递推：$W(1) = 1$，$W(i) = W(p_i) + i$。

于是把职位 $x$ 上的员工换成候选人 $y$ 带来的增益为 $(b_y - a_x) \cdot W(x)$，总效率的初始值为 $\sum_u a_u W(u)$。

题目要求选出的职位下标 $x_1 < x_2 < \dots < x_k$ 与候选人下标 $y_1 < y_2 < \dots < y_k$ 按下标顺序一一配对，即一个**保序匹配**。设 $dp[i][j]$ 为只考虑前 $i$ 个职位、前 $j$ 名候选人时能获得的最大总增益，转移：

$$dp[i][j] = \max\big(dp[i-1][j],\ dp[i][j-1],\ dp[i-1][j-1] + (b_j - a_i) W(i)\big)$$

三个分支分别对应：不换第 $i$ 号职位、不用第 $j$ 名候选人、用第 $j$ 名候选人替换第 $i$ 号职位。由于不选任何人的增益为 $0$，负增益会被自然忽略。答案即初始值加 $dp[n][m]$。

## 复杂度

时间 $O(nm)$，空间 $O(m)$（滚动数组只保留两行）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]

    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let p = if (n > 1) {
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ q: String => Int64.parse(q) })
    } else {
        Array<Int64>(0, { _ => 0 })
    }

    // w[i]: 根到职位 i+1 的路径上职位编号之和（0 基下标）
    let w = Array<Int64>(n, { _ => 0 })
    w[0] = 1
    var base: Int64 = a[0]
    for (i in 1..n) {
        w[i] = w[p[i - 1] - 1] + (i + 1)
        base = base + a[i] * w[i]
    }

    // 保序匹配 DP：dp[i][j] = 用前 i 个职位、前 j 个候选人能获得的最大增益
    // 滚动两行：prev 为 dp[i-1]，cur 为 dp[i]
    var prev = Array<Int64>(m + 1, { _ => 0 })
    var cur = Array<Int64>(m + 1, { _ => 0 })
    for (i in 0..n) {
        let wi = w[i]
        let ai = a[i]
        cur[0] = 0
        for (j in 1..(m + 1)) {
            let gain = prev[j - 1] + (b[j - 1] - ai) * wi
            let t = if (prev[j] > cur[j - 1]) { prev[j] } else { cur[j - 1] }
            cur[j] = if (t > gain) { t } else { gain }
        }
        let tmp = prev
        prev = cur
        cur = tmp
    }

    println(base + prev[m])
}
```

</details>
