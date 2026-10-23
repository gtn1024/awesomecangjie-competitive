---
oj: dmy
pid: '511'
title: '[R80F] 标签'
difficulty: 提高+/省选-
tags:
  - 字符串
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

## 数据规模

$1 \le n \le 3 \times 10^5$，$S$ 只含小写英文字母。子任务 1 为 $n \le 2000$，子任务 2 附加「至多两种字母」的特殊性质，子任务 3 无特殊限制。答案为 $O(n^3)$ 级别，$n = 3 \times 10^5$ 时约 $1.4 \times 10^{16}$，需要用 64 位整数保存。

## 思路

**先把 $f(T)$ 写清楚。** 对子串 $S[l,r]$，位置 $t$（$l \le t < r$）能切开，当且仅当 $S[l,t]$ 与 $S[t+1,r]$ 没有公共字母。所有能切的位置可以同时切开：若某个字母出现在两个不同的段里，它必然跨过某个切点，而那个切点的两侧就含有公共字母，矛盾。因此

$$
f(S[l,r]) = 1 + (\text{子串内部可切位置的个数}).
$$

**把答案按切点分摊。** 每个子串先贡献基础 $1$，合计 $\dfrac{n(n+1)}2$；再对每个切点统计它在多少个子串中可切。记 $C_t$ 为「位置 $t$ 可作为可切位置」的子串个数，则

$$
\text{答案} = \frac{n(n+1)}2 + \sum_{t=1}^{n-1} C_t .
$$

**固定切点 $t$，求 $C_t$。** 令 $\mathit{last}_c$ 为字母 $c$ 在 $S[1,t]$ 中最后一次出现的位置（没出现记为 $0$）。固定右端点 $r > t$，记

$$
B = \max_{c \in S[t+1,r]} \mathit{last}_c .
$$

右侧出现的每个字母，它在左侧的所有出现位置都必须被排除；而排除它的最后一次出现，就等价于排除它的全部出现。于是 $t$ 可切当且仅当 $l > B$，合法左端点恰有 $t - B$ 个。

**$B$ 只会变化 $26$ 次。** 随着 $r$ 向右扫，$B$ 只在 $r$ 第一次遇到某个新字母时改变，右侧字母集合至多扩张 $26$ 次，所以右端点被分成至多 $26$ 段，每段内 $B$ 恒定，逐段求和即可在 $O(26)$ 时间内算出 $C_t$。

**实现细节。** 从 $r$ 的角度逐段求和需要按首次出现位置给字母排序，实际上换成下面的等价写法，可以让每个切点只用一次线性扫描。

- 用 $\mathit{nxt}_c$ 表示切点右侧字母 $c$ 第一次出现的位置（没有则为 $n+1$）。切点从 $k-1$ 右移到 $k$ 时，只有字母 $S[k]$ 的 $\mathit{nxt}$ 会变，借助「同字母下一次出现」的后继数组即可 $O(1)$ 更新。
- 把左侧出现过的字母按 $\mathit{last}$ 降序存进 $\mathit{order}$。切点右移一位后，新进入左侧的字母 $S[k]$ 其 $\mathit{last}$ 恰为 $k$，严格大于其他所有字母；其余字母的 $\mathit{last}$ 与相对次序都不变。因此只需把 $S[k]$ 挪到 $\mathit{order}$ 队首，一次移位就完成维护。
- 设 $\mathit{order}$ 中的字母为 $\mathit{order}[0], \ldots, \mathit{order}[s-1]$，令 $L_i = \min_{j \le i} \mathit{nxt}_{\mathit{order}[j]}$，并约定 $\mathit{last}_{\mathit{order}[s]} = 0$。对右端点 $r$，令 $i^*(r)$ 为第一个满足 $\mathit{nxt}_{\mathit{order}[i]} \le r$ 的下标（不存在时记作 $s$），则 $B(r) = \mathit{last}_{\mathit{order}[i^*(r)]}$，该右端点贡献 $k - B(r)$。
- 关键一步：因为 $\mathit{last}_{\mathit{order}[0]} = k$（切点字母就在左侧末尾），有

$$
k - B(r) = \sum_{i < i^*(r)} \bigl( \mathit{last}_{\mathit{order}[i]} - \mathit{last}_{\mathit{order}[i+1]} \bigr).
$$

  交换求和次序，条件 $i < i^*(r)$ 等价于「$\mathit{order}[0..i]$ 这些字母都没有出现在 $S[k+1,r]$ 中」，也就是 $r < L_i$。右端点 $r$ 的取值范围是 $[k+1,n]$，其中满足 $r < L_i$ 的恰有 $L_i - k - 1$ 个，故

$$
C_k = \sum_i \bigl( \mathit{last}_{\mathit{order}[i]} - \mathit{last}_{\mathit{order}[i+1]} \bigr) \, (L_i - k - 1).
$$

- $L_i$ 随 $i$ 单调不增，一旦 $L_i = k+1$，本项与后面所有项都是 $0$，可以立即跳出。

## 复杂度

每个切点内层至多扫 $26$ 个字母，时间 $O(26n)$。空间上只有后继数组是 $O(n)$，其余数组长度均为 $26$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()

    let successor = Array<Int64>(n, { _ => 0 })
    let nxt = Array<Int64>(26, { _ => n + 1 })
    var i = n - 1
    while (i >= 0) {
        let c = Int64(s[i]) - 97
        successor[i] = nxt[c]
        nxt[c] = i + 1
        i -= 1
    }

    let last = Array<Int64>(26, { _ => 0 })
    let order = Array<Int64>(26, { _ => 0 })
    var kinds: Int64 = 0
    var answer = n * (n + 1) / 2
    for (k in 1..n) {
        let c = Int64(s[k - 1]) - 97
        var at: Int64 = 0
        while (at < kinds && order[at] != c) {
            at += 1
        }
        if (at == kinds) {
            kinds += 1
        }
        var j = at
        while (j > 0) {
            order[j] = order[j - 1]
            j -= 1
        }
        order[0] = c
        last[c] = k
        nxt[c] = successor[k - 1]
        var limit = n + 1
        var idx: Int64 = 0
        while (idx < kinds) {
            if (nxt[order[idx]] < limit) {
                limit = nxt[order[idx]]
            }
            if (limit == k + 1) {
                break
            }
            var lower: Int64 = 0
            if (idx + 1 < kinds) {
                lower = last[order[idx + 1]]
            }
            answer += (last[order[idx]] - lower) * (limit - k - 1)
            idx += 1
        }
    }
    println(answer)
}
```

</details>
