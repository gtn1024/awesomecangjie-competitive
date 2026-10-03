---
oj: dmy
pid: '219'
title: '[R36D]字符串序列'
difficulty: 提高
tags:
  - 分治
  - 递归
timeLimit: 1s
memoryLimit: 256m
---

## 题意

定义字符串序列 $s_0, s_1, s_2, \dots$，给定 $s_0$，对 $i \ge 1$：

$$s_i = s_{i-1} + \text{'a'} + \text{next}(s_{i-1})$$

其中 $\text{next}(s)$ 把每个字符替换成字母表中的下一个字符（`z` 变 `a`）。

给定 $T$ 组询问，每组给出 $s_0$ 与正整数 $k$，求 $s_{10^{100}}$ 的第 $k$ 个字符（下标从 $1$ 开始）。$T \le 10^4$，$|s_0| \le 10$，$k \le 10^{18}$。

## 思路

$s_{10^{100}}$ 长到无法显式构造，但其结构是高度递归的，直接分治定位即可。

记 $\text{len}_i = |s_i|$，则 $\text{len}_i = 2\text{len}_{i-1} + 1$。由于每层长度翻倍，$\text{len}_i$ 增长极快，约 $\log_2(10^{18}) \approx 60$ 层就超过 $k$。因此对每组询问，先从小到大预处理长度序列，直到某层长度 $\ge k$，设这层为第 $\text{level}$ 层（任意更高层都会在递归下降时被跳过，所以取恰好够用的那层即可）。

第 $\text{level}$ 层的结构为：

$$s_{\text{level}} = \underbrace{s_{\text{level}-1}}_{\text{左半}} \;|\; \text{'a'} \;|\; \underbrace{\text{next}(s_{\text{level}-1})}_{\text{右半}}$$

设 $\text{mid} = \text{len}_{\text{level}-1} + 1$（中间那个 `a` 的位置）。对查询位置 $k$：

- 若 $k = \text{mid}$，答案就是 `a`，再累计上累计的位移即可。
- 若 $k < \text{mid}$，落点在左半，等价于查询第 $\text{level}-1$ 层的第 $k$ 位，递归。
- 若 $k > \text{mid}$，落点在右半 $\text{next}(s_{\text{level}-1})$，等价于查询第 $\text{level}-1$ 层的第 $k - \text{mid}$ 位，但最终结果需要再 next 一次。

关键观察：每往右半走一次，最终取到的 $s_0$ 中的字符都要整体 `next` 一次（`z` 后绕回 `a`）。因此只需维护一个位移计数 $\text{shift}$，每次进入右半就 $\text{shift} \mathrel{+}= 1$。最后若落到 $s_0$ 的某个字符 $c$，答案是 $(c - \text{'a'} + \text{shift}) \bmod 26 + \text{'a'}$；若中途命中 `a`，答案是 $(\text{shift}) \bmod 26 + \text{'a'}$。

整个下降过程每层最多走一次，深度约 60，单次查询 $O(\log k)$，总复杂度 $O(T \log k)$。

注意 $\text{len}_i$ 增长时要设一个上界（如 $2 \times 10^{18}$）避免 `Int64` 溢出。

## 代码

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*
import std.collection.*

main() {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    let limit = Int64(2000000000000000000) // 2e18，防止 len 预处理溢出
    for (_ in 0..t) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let l = Int64.parse(parts[0])
        let k = Int64.parse(parts[1])
        let s0 = reader.readln().getOrThrow().toRuneArray()
        // 预处理每层长度，直到 >= k
        var lenList = ArrayList<Int64>()
        var cur = l
        lenList.add(cur)
        while (cur < k && cur < limit) {
            cur = cur * 2 + 1
            lenList.add(cur)
        }
        // 从最深层开始递归下降
        var level = Int64(lenList.size - 1)
        var kk = k
        var shift = Int64(0)
        var done = false
        while (level > 0) {
            let prevLen = lenList[level - 1]
            let mid = prevLen + 1
            if (kk == mid) {
                let c = shift % 26 + 97
                println(Rune(UInt32(c)))
                done = true
                break
            } else if (kk < mid) {
                level = level - 1
            } else {
                kk = kk - mid
                shift = shift + 1
                level = level - 1
            }
        }
        if (!done) {
            // level == 0，落到 s_0[kk-1]
            let base = Int64(UInt32(s0[kk - 1])) - 97
            let c = (base + shift) % 26 + 97
            println(Rune(UInt32(c)))
        }
    }
}
```

</details>
