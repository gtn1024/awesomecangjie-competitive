---
oj: dmy
pid: '430'
title: '[R69D] 卡牌游戏'
difficulty: 普及/提高-
tags:
  - DP
  - 背包
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n, C \le 1000$，$1 \le c_i \le 1000$，$t_i \in \{0, 1\}$，$1 \le x_i \le 10^5$。

## 思路

强化牌会永久提高法术强度，因此**先打出所有强化牌、再打出所有伤害牌**一定最优：强化牌之间顺序无关，而伤害牌越晚打享受的加成越高。

设选中的强化牌参数和为 $S$、伤害牌参数和为 $D$，则每张伤害牌造成 $x_i \times (1 + S)$ 点伤害，总伤害为：

$$
\sum_{\text{伤害牌}} x_i \times (1 + S) = D \times (1 + S)
$$

问题转化为：在费用 $C$ 内分别选择一组强化牌（总费用 $c_S$、总加成 $S$）和一组伤害牌（总费用 $c_D$、总基础伤害 $D$），最大化 $D \times (1 + S)$，且 $c_S + c_D \le C$。两类牌的选择相互独立，只共享费用。

对两类牌分别做一次 0/1 背包：

- `f[j]`：费用不超过 $j$ 时伤害牌能获得的最大基础伤害和；
- `g[j]`：费用不超过 $j$ 时强化牌能获得的最大法术强度和。

最后枚举给强化牌分配的费用 $i$，伤害牌分到 $C - i$，答案为：

$$
\max_{0 \le i \le C} (g[i] + 1) \times f[C - i]
$$

复杂度：时间 $O(nC)$，空间 $O(C)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let C = line[1]
    // f[j]: 费用不超过 j 时伤害牌能获得的最大基础伤害和
    // g[j]: 费用不超过 j 时强化牌能获得的最大法术强度和
    let f = Array<Int64>(C + 1, { _ => 0 })
    let g = Array<Int64>(C + 1, { _ => 0 })
    for (_ in 0..n) {
        let card = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let c = card[0]
        let t = card[1]
        let x = card[2]
        var j = C
        if (t == 0) {
            while (j >= c) {
                if (f[j - c] + x > f[j]) {
                    f[j] = f[j - c] + x
                }
                j -= 1
            }
        } else {
            while (j >= c) {
                if (g[j - c] + x > g[j]) {
                    g[j] = g[j - c] + x
                }
                j -= 1
            }
        }
    }
    // 枚举给强化牌分配的费用 i，伤害牌分到 C-i
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i <= C) {
        let v = (g[i] + 1) * f[C - i]
        if (v > ans) {
            ans = v
        }
        i += 1
    }
    println(ans)
    return 0
}
```

要点：

- 背包按「费用不超过 $j$」定义，容量从 $C$ 递减到 $c$ 更新，保证每张牌最多选一次；最终 `f[j]`、`g[j]` 直接就是费用不超过 $j$ 的最优值，枚举分配时无需再做后缀取 $\max$。
- 乘积 `(g[i] + 1) * f[C - i]` 最大可达约 $10^{16}$，超出 32 位整型范围，用 `Int64` 计算。
