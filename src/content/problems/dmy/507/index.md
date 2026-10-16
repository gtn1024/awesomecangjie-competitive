---
oj: dmy
pid: '507'
title: 踏步机器人
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 100$，$1 \le A_i \le 100$，$1 \le X \le 10^5$，$0 \le M \le 100$，坏位置互不相同且满足 $1 \le B_i < X$。

## 思路

**设 $\mathit{reach}[i]$ 表示机器人能否恰好落在位置 $i$。** 位置 $0$ 是出发点，恒有 $\mathit{reach}[0] = \mathsf{true}$。位置 $i$（$i \ge 1$）可达，当且仅当它本身不是坏位置，并且存在某种跳跃距离 $A_j$ 使得位置 $i - A_j$ 可达。于是按 $i$ 从小到大递推：

$$\mathit{reach}[i] = \mathit{good}[i] \land \bigvee_{j=1}^{N} \bigl(A_j \le i \land \mathit{reach}[i - A_j]\bigr).$$

注意「不能落在坏位置」只禁止落脚点：从 $i - A_j$ 跳到 $i$ 的中间过程会越过一些位置，越过坏位置是允许的（样例中 $3 \to 8$ 就越过了坏位置 $6$）。最终答案即 $\mathit{reach}[X]$，输出 `Yes` / `No`。

实现上用一个布尔数组标记坏位置，再开一个布尔数组递推可达性即可。$M = 0$ 时输入没有第五行，读入时跳过即可。

## 复杂度

时间 $O(X \cdot N)$（至多 $10^7$ 次检查），空间 $O(X + M)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    reader.readln().getOrThrow()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let x = Int64.parse(reader.readln().getOrThrow())
    let m = Int64.parse(reader.readln().getOrThrow())
    let size = x + 1
    let good = Array<Bool>(size, { _ => true })
    if (m > 0) {
        let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        for (v in b) {
            good[v] = false
        }
    }
    let reach = Array<Bool>(size, { _ => false })
    reach[0] = true
    var pos: Int64 = 1
    while (pos <= x) {
        if (good[pos]) {
            for (v in a) {
                if (v <= pos && reach[pos - v]) {
                    reach[pos] = true
                }
            }
        }
        pos += 1
    }
    if (reach[x]) {
        println("Yes")
    } else {
        println("No")
    }
}
```

</details>
